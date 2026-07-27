"use strict";

const {
  Plugin,
  Modal,
  Notice,
  Setting,
  PluginSettingTab,
  MarkdownView,
  Menu,
  editorInfoField
} = require("obsidian");
const { Decoration, EditorView, WidgetType } = require("@codemirror/view");
const { StateField } = require("@codemirror/state");

// Keep the production entry point self-contained. Obsidian loads main.js in a
// plugin sandbox where relative CommonJS modules are not consistently resolved.
const COLORS = ["amber", "blue", "green", "red", "purple"];
const PLACEMENTS = ["auto", "top", "bottom", "left", "right"];
const ANNOTATION_SOURCE =
  '<span class="va-annotation va-color-(' +
  COLORS.join("|") +
  ') va-place-(' +
  PLACEMENTS.join("|") +
  ')" data-va-note="([^"]*)"(?: data-va-id="([^"]*)")?>([\\s\\S]*?)<\\/span>';

const DEFAULT_SETTINGS = { defaultColor: "blue" };

const COLOR_LABELS = {
  amber: "橙色",
  blue: "蓝色",
  green: "绿色",
  red: "红色",
  purple: "紫色"
};

function annotationRegex() {
  return new RegExp(ANNOTATION_SOURCE, "g");
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function decodeAttribute(value) {
  return String(value)
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function createAnnotationId() {
  return `va-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildAnnotation(text, note, color, placement = "auto", id = "") {
  if (!COLORS.includes(color)) throw new Error(`Unsupported color: ${color}`);
  if (!PLACEMENTS.includes(placement)) {
    throw new Error(`Unsupported placement: ${placement}`);
  }
  const idAttribute = id ? ` data-va-id="${escapeAttribute(id)}"` : "";
  return `<span class="va-annotation va-color-${color} va-place-${placement}" data-va-note="${escapeAttribute(note)}"${idAttribute}>${text}</span>`;
}

function annotationFromMatch(match) {
  return {
    start: match.index,
    end: match.index + match[0].length,
    full: match[0],
    color: match[1],
    placement: match[2],
    note: decodeAttribute(match[3]),
    id: decodeAttribute(match[4] || ""),
    text: match[5]
  };
}

function findAnnotationAtOffset(source, offset) {
  const regex = annotationRegex();
  let match;
  while ((match = regex.exec(source)) !== null) {
    const annotation = annotationFromMatch(match);
    if (offset >= annotation.start && offset <= annotation.end) return annotation;
  }
  return null;
}

function findAnnotationOverlappingRange(source, startOffset, endOffset) {
  const regex = annotationRegex();
  let match;
  while ((match = regex.exec(source)) !== null) {
    const annotation = annotationFromMatch(match);
    if (startOffset < annotation.end && endOffset > annotation.start) return annotation;
  }
  return null;
}

function findAnnotationByIdentity(source, identity) {
  const regex = annotationRegex();
  let match;
  let fallback = null;
  while ((match = regex.exec(source)) !== null) {
    const annotation = annotationFromMatch(match);
    if (identity.id && annotation.id === identity.id) return annotation;
    if (
      !fallback &&
      annotation.text === identity.text &&
      annotation.note === identity.note &&
      annotation.color === identity.color
    ) {
      fallback = annotation;
    }
  }
  return fallback;
}

function getAnnotationColor(element) {
  return COLORS.find((color) => element.classList.contains(`va-color-${color}`)) || "blue";
}

function getAnnotationPlacement(element) {
  return (
    PLACEMENTS.find((placement) => element.classList.contains(`va-place-${placement}`)) ||
    "auto"
  );
}

function identityFromElement(element) {
  return {
    id: element.getAttribute("data-va-id") || "",
    text: element.textContent || "",
    note: element.getAttribute("data-va-note") || "",
    color: getAnnotationColor(element),
    placement: getAnnotationPlacement(element)
  };
}

function visibleTextLength(value) {
  return String(value)
    .replace(/<[^>]*>/g, "")
    .replace(/[*_~`#>\[\]()]/g, "")
    .trim().length;
}

function annotationAnchorOnLine(source, line, annotation) {
  const lineSource = source.slice(line.from, line.to);
  const beforeSource = source.slice(line.from, annotation.start);
  const total = Math.max(visibleTextLength(lineSource), 1);
  const before = visibleTextLength(beforeSource);
  const target = Math.max(visibleTextLength(annotation.text), 1);
  return Math.max(0.02, Math.min(0.98, (before + target / 2) / total));
}

function lineAtOffset(source, offset) {
  const safeOffset = Math.max(0, Math.min(Number(offset) || 0, source.length));
  const previousBreak =
    safeOffset > 0 ? source.lastIndexOf("\n", safeOffset - 1) : -1;
  const nextBreak = source.indexOf("\n", safeOffset);
  return {
    from: previousBreak === -1 ? 0 : previousBreak + 1,
    to: nextBreak === -1 ? source.length : nextBreak
  };
}

function distributeAnnotations(annotations) {
  const distributed = { top: [], bottom: [] };
  const ordered = [...annotations].sort(
    (a, b) =>
      Number(a.anchorRatio ?? 0.5) - Number(b.anchorRatio ?? 0.5) ||
      Number(a.start ?? 0) - Number(b.start ?? 0)
  );
  const unmeasuredAutomatic = ordered.filter(
    (annotation) =>
      annotation.placement !== "top" &&
      annotation.placement !== "left" &&
      annotation.placement !== "bottom" &&
      annotation.placement !== "right" &&
      annotation.preferredSide !== "top" &&
      annotation.preferredSide !== "bottom"
  );
  const topUnmeasuredCount = Math.ceil(unmeasuredAutomatic.length / 2);
  let unmeasuredIndex = 0;

  for (const annotation of ordered) {
    let side;
    if (annotation.placement === "top" || annotation.placement === "left") {
      side = "top";
    } else if (annotation.placement === "bottom" || annotation.placement === "right") {
      side = "bottom";
    } else if (annotation.preferredSide === "top" || annotation.preferredSide === "bottom") {
      side = annotation.preferredSide;
    } else {
      side = unmeasuredIndex < topUnmeasuredCount ? "top" : "bottom";
      unmeasuredIndex += 1;
    }
    distributed[side].push(annotation);
  }
  return distributed;
}

function getEditorSourcePath(viewOrState) {
  const state = viewOrState.state || viewOrState;
  const info = state.field(editorInfoField, false);
  return (info && info.file && info.file.path) || "";
}

class AnnotationRailWidget extends WidgetType {
  constructor(plugin, annotations, sourcePath, placement) {
    super();
    this.plugin = plugin;
    this.annotations = annotations;
    this.sourcePath = sourcePath;
    this.placement = placement;
    this.signature = `${placement}\u0003${annotations
      .map((annotation) =>
        [
          annotation.id,
          annotation.note,
          annotation.color,
          annotation.text,
          annotation.anchorRatio
        ].join("\u0001")
      )
      .join("\u0002")}`;
  }

  eq(other) {
    return other instanceof AnnotationRailWidget && other.signature === this.signature;
  }

  toDOM(view) {
    const doc = view.dom.ownerDocument;
    return this.plugin.createAnnotationRail(
      this.annotations,
      this.sourcePath || getEditorSourcePath(view),
      doc,
      "editor",
      this.placement,
      { editorView: view }
    );
  }

  ignoreEvent() {
    return true;
  }
}

function buildEditorRailDecorations(state, plugin) {
  const source = state.doc.toString();
  const grouped = new Map();
  const regex = annotationRegex();
  let match;
  while ((match = regex.exec(source)) !== null) {
    const annotation = annotationFromMatch(match);
    const line = state.doc.lineAt(annotation.start);
    annotation.anchorRatio = annotationAnchorOnLine(source, line, annotation);
    annotation.preferredSide = annotation.anchorRatio <= 0.5 ? "top" : "bottom";
    if (!grouped.has(line.from)) grouped.set(line.from, { line, annotations: [] });
    grouped.get(line.from).annotations.push(annotation);
  }

  const sourcePath = getEditorSourcePath(state);
  const decorations = [];
  for (const { line, annotations } of grouped.values()) {
    const distributed = distributeAnnotations(annotations);
    if (distributed.top.length) {
      const hasPreviousLine = line.from > 0;
      const topBoundary = hasPreviousLine
        ? state.doc.lineAt(line.from - 1).to
        : line.from;
      decorations.push(
        Decoration.widget({
          widget: new AnnotationRailWidget(plugin, distributed.top, sourcePath, "top"),
          block: true,
          side: hasPreviousLine ? 200 : -100
        }).range(topBoundary)
      );
    }
    if (distributed.bottom.length) {
      decorations.push(
        Decoration.widget({
          widget: new AnnotationRailWidget(plugin, distributed.bottom, sourcePath, "bottom"),
          block: true,
          side: 100
        }).range(line.to)
      );
    }
  }
  return Decoration.set(decorations, true);
}

function createEditorRailExtension(plugin) {
  // Block widgets affect vertical layout. CodeMirror requires them to be
  // provided synchronously by a StateField, not by a ViewPlugin.
  const rails = StateField.define({
    create(state) {
      return buildEditorRailDecorations(state, plugin);
    },
    update(decorations, transaction) {
      if (!transaction.docChanged) return decorations;
      return buildEditorRailDecorations(transaction.state, plugin);
    },
    provide: (field) => EditorView.decorations.from(field)
  });

  const interactions = EditorView.domEventHandlers({
    click(event, view) {
      const annotation = event.target.closest && event.target.closest(".va-annotation");
      if (!annotation) return false;
      plugin.selectRenderedAnnotation(annotation, null);
      return false;
    },
    dblclick(event, view) {
      const annotation = event.target.closest && event.target.closest(".va-annotation");
      if (!annotation) return false;
      event.preventDefault();
      plugin.editRenderedAnnotation(
        getEditorSourcePath(view),
        identityFromElement(annotation),
        annotation.ownerDocument
      );
      return true;
    },
    contextmenu(event, view) {
      const annotation = event.target.closest && event.target.closest(".va-annotation");
      if (!annotation) return false;
      event.preventDefault();
      plugin.showRenderedAnnotationMenu(
        event,
        getEditorSourcePath(view),
        identityFromElement(annotation),
        annotation.ownerDocument
      );
      return true;
    }
  });

  return [rails, interactions];
}

class AnnotationModal extends Modal {
  constructor(app, initial, onSubmit) {
    super(app);
    this.state = { ...initial };
    this.onSubmit = onSubmit;
    this.colorButtons = new Map();
  }

  onOpen() {
    const { contentEl } = this;
    this.modalEl.addClass("va-modal-shell");
    contentEl.empty();
    contentEl.addClass("va-modal");
    contentEl.createEl("h2", {
      text: this.state.editing ? "编辑批注" : "添加批注"
    });

    const field = contentEl.createDiv({ cls: "va-note-field" });
    field.createEl("label", { text: "批注文字", attr: { for: "va-note-input" } });
    const input = field.createEl("textarea", {
      cls: "va-note-input",
      attr: {
        id: "va-note-input",
        rows: "3",
        placeholder: "输入批注，例如：核心结论",
        autocomplete: "off",
        spellcheck: "false"
      }
    });
    input.value = this.state.note || "";
    input.addEventListener("input", () => {
      this.state.note = input.value;
    });

    const colorSection = contentEl.createDiv({ cls: "va-color-section" });
    colorSection.createDiv({ cls: "va-field-label", text: "颜色" });
    const palette = colorSection.createDiv({ cls: "va-color-palette" });
    for (const color of COLORS) {
      const button = palette.createEl("button", {
        cls: `va-color-choice va-color-${color}`,
        attr: {
          type: "button",
          "aria-label": COLOR_LABELS[color],
          title: COLOR_LABELS[color]
        }
      });
      button.createSpan({ cls: "va-color-swatch" });
      button.addEventListener("click", () => {
        this.state.color = color;
        this.updateColorSelection();
      });
      this.colorButtons.set(color, button);
    }
    this.updateColorSelection();

    const selectedText = this.state.text || "";
    const excerpt = selectedText.length > 42 ? `${selectedText.slice(0, 42)}…` : selectedText;
    const target = contentEl.createDiv({ cls: "va-selected-text" });
    target.createSpan({ cls: "va-selected-text-label", text: "批注对象" });
    target.createSpan({ cls: "va-selected-text-value", text: excerpt });

    contentEl.createDiv({
      cls: "va-auto-position-hint",
      text: "批注会显示在正文上方的独立批注栏，不会遮住正文。"
    });

    const actions = contentEl.createDiv({ cls: "va-modal-actions" });
    const cancel = actions.createEl("button", {
      text: "取消",
      attr: { type: "button" }
    });
    cancel.addEventListener("click", () => this.close());
    const submit = actions.createEl("button", {
      cls: "mod-cta",
      text: this.state.editing ? "保存" : "添加",
      attr: { type: "button" }
    });
    const submitForm = () => {
      const note = (this.state.note || "").trim();
      if (!note) {
        new Notice("请输入批注文字");
        input.focus();
        return;
      }
      this.onSubmit({ ...this.state, note, placement: "auto" });
      this.close();
    };
    submit.addEventListener("click", submitForm);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.isComposing) {
        event.preventDefault();
        submitForm();
      }
    });
    window.setTimeout(() => {
      input.focus();
      input.select();
    }, 20);
  }

  updateColorSelection() {
    for (const [color, button] of this.colorButtons) {
      const selected = color === this.state.color;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    }
  }

  onClose() {
    this.contentEl.empty();
  }
}

class VisualAnnotationsSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("默认颜色")
      .setDesc("添加批注时预先选中的颜色")
      .addDropdown((dropdown) => {
        for (const color of COLORS) dropdown.addOption(color, COLOR_LABELS[color]);
        dropdown.setValue(this.plugin.settings.defaultColor).onChange(async (value) => {
          this.plugin.settings.defaultColor = value;
          await this.plugin.saveSettings();
        });
      });
  }
}

module.exports = class VisualAnnotationsPlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.registerEditorExtension(createEditorRailExtension(this));

    this.addCommand({
      id: "add-visual-annotation",
      name: "为所选文字添加视觉批注",
      editorCheckCallback: (checking, editor) => {
        if (!this.isEditingModeActive()) return false;
        const selection = editor.getSelection();
        if (!selection || this.getActiveAnnotation(editor)) return false;
        if (!checking) this.addAnnotation(editor);
        return true;
      }
    });

    this.addCommand({
      id: "edit-visual-annotation",
      name: "编辑所选或光标处的视觉批注",
      editorCheckCallback: (checking, editor) => {
        if (!this.isEditingModeActive()) return false;
        const annotation = this.getActiveAnnotation(editor);
        if (!annotation) return false;
        if (!checking) this.editAnnotation(editor, annotation);
        return true;
      }
    });

    this.addCommand({
      id: "remove-visual-annotation",
      name: "删除所选或光标处的视觉批注（保留正文）",
      editorCheckCallback: (checking, editor) => {
        if (!this.isEditingModeActive()) return false;
        const annotation = this.getActiveAnnotation(editor);
        if (!annotation) return false;
        if (!checking) this.removeAnnotation(editor, annotation);
        return true;
      }
    });

    this.addRibbonIcon("message-square-plus", "添加视觉批注", () => {
      const view = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (!view) {
        new Notice("请先打开 Markdown 文档");
        return;
      }
      if (typeof view.getMode === "function" && view.getMode() !== "source") {
        new Notice("阅读模式为只读；请切换到编辑模式");
        return;
      }
      if (!view.editor.getSelection()) {
        new Notice("请先选中要批注的文字");
        return;
      }
      if (this.getActiveAnnotation(view.editor)) {
        new Notice("所选文字已经有批注；请使用编辑或删除");
        return;
      }
      this.addAnnotation(view.editor);
    });

    this.registerEvent(
      this.app.workspace.on("editor-menu", (menu, editor) => {
        const annotation = this.getActiveAnnotation(editor);
        if (annotation) {
          menu.addItem((item) =>
            item
              .setTitle("编辑所选批注")
              .setIcon("pencil")
              .onClick(() => this.editAnnotation(editor, annotation))
          );
          menu.addItem((item) =>
            item
              .setTitle("删除所选批注（保留正文）")
              .setIcon("eraser")
              .onClick(() => this.removeAnnotation(editor, annotation))
          );
        } else if (editor.getSelection()) {
          menu.addItem((item) =>
            item
              .setTitle("添加视觉批注")
              .setIcon("message-square-plus")
              .onClick(() => this.addAnnotation(editor))
          );
        }
      })
    );

    this.registerMarkdownPostProcessor((element, context) => {
      this.renderAnnotations(element, context);
    });

    this.addSettingTab(new VisualAnnotationsSettingTab(this.app, this));
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  isEditingModeActive() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    return !view || typeof view.getMode !== "function" || view.getMode() === "source";
  }

  getActiveAnnotation(editor) {
    const source = editor.getValue();
    const from = editor.posToOffset(editor.getCursor("from"));
    const to = editor.posToOffset(editor.getCursor("to"));
    if (from !== to) return findAnnotationOverlappingRange(source, from, to);
    return findAnnotationAtOffset(source, from);
  }

  addAnnotation(editor) {
    const selected = editor.getSelection();
    if (!selected) {
      new Notice("请先选中要批注的文字");
      return;
    }
    if (/\r|\n/.test(selected)) {
      new Notice("目前仅支持单行文字批注");
      return;
    }
    if (selected.includes('<span class="va-annotation') || selected.includes("</span>")) {
      new Notice("选区已经包含批注或不兼容的 HTML");
      return;
    }

    const leading = selected.match(/^\s*/)[0];
    const trailing = selected.match(/\s*$/)[0];
    const text = selected.slice(leading.length, selected.length - trailing.length);
    if (!text) {
      new Notice("选区不能只包含空格");
      return;
    }

    new AnnotationModal(
      this.app,
      {
        editing: false,
        text,
        note: "",
        color: this.settings.defaultColor,
        placement: "auto"
      },
      ({ note, color }) => {
        const replacement =
          leading + buildAnnotation(text, note, color, "auto", createAnnotationId()) + trailing;
        editor.replaceSelection(replacement);
        new Notice("视觉批注已添加");
      }
    ).open();
  }

  editAnnotation(editor, annotation) {
    new AnnotationModal(
      this.app,
      {
        editing: true,
        text: annotation.text,
        note: annotation.note,
        color: annotation.color,
        placement: "auto"
      },
      ({ note, color }) => {
        const source = editor.getValue();
        const replacement = buildAnnotation(
          annotation.text,
          note,
          color,
          "auto",
          annotation.id || createAnnotationId()
        );
        const next =
          source.slice(0, annotation.start) + replacement + source.slice(annotation.end);
        editor.setValue(next);
        const start = editor.offsetToPos(annotation.start);
        const end = editor.offsetToPos(annotation.start + replacement.length);
        editor.setSelection(start, end);
        new Notice("视觉批注已更新");
      }
    ).open();
  }

  removeAnnotation(editor, annotation) {
    const source = editor.getValue();
    const next = source.slice(0, annotation.start) + annotation.text + source.slice(annotation.end);
    editor.setValue(next);
    const start = editor.offsetToPos(annotation.start);
    const end = editor.offsetToPos(annotation.start + annotation.text.length);
    editor.setSelection(start, end);
    new Notice("批注已删除，正文已保留");
  }

  renderAnnotations(element, context) {
    const annotations = Array.from(element.querySelectorAll(".va-annotation"));
    if (!annotations.length) return;

    const grouped = new Map();
    for (const annotation of annotations) {
      const container = annotation.closest("p, li, blockquote, td") || annotation.parentElement;
      if (!container) continue;
      if (!grouped.has(container)) grouped.set(container, []);
      grouped.get(container).push(annotation);
    }

    for (const [container, items] of grouped) {
      let sectionInfo = null;
      if (context && typeof context.getSectionInfo === "function") {
        for (const candidate of [container, items[0], element]) {
          try {
            sectionInfo = context.getSectionInfo(candidate);
          } catch (error) {
            sectionInfo = null;
          }
          if (sectionInfo && typeof sectionInfo.text === "string") break;
        }
      }
      const sourceMetrics = this.measureRenderedSourceFlow(
        items,
        sectionInfo && sectionInfo.text
      );
      this.scheduleRenderedAnnotationRails(
        container,
        items,
        context.sourcePath,
        sourceMetrics
      );
    }
  }

  scheduleRenderedAnnotationRails(container, items, sourcePath, sourceMetrics = new Map()) {
    const doc = container.ownerDocument;
    const view = doc.defaultView;
    const railTagName = "span";
    const render = () => {
      const previousRails = new Set([
        ...(container._vaReadingRails || []),
        ...Array.from(container.children || []).filter((child) =>
          child.classList.contains("va-reading-rail")
        )
      ]);
      previousRails.forEach((rail) => {
        if (rail) {
          if (rail._vaResizeObserver) rail._vaResizeObserver.disconnect();
          rail.remove();
        }
      });
      container._vaReadingRails = [];

      const containerRect = container.getBoundingClientRect();
      const railItems = items.map((annotation) => {
        const renderedMetrics = this.measureRenderedTarget(annotation, containerRect);
        const sourceMetric = sourceMetrics.get(annotation);
        return {
          ...identityFromElement(annotation),
          targetElement: annotation,
          ...renderedMetrics,
          anchorRatio: sourceMetric
            ? sourceMetric.anchorRatio
            : renderedMetrics.anchorRatio,
          preferredSide: sourceMetric
            ? sourceMetric.preferredSide
            : this.measureRenderedTextFlow(annotation, container) <= 0.5
              ? "top"
              : "bottom"
        };
      });
      const distributed = distributeAnnotations(railItems);
      if (distributed.top.length) {
        const topRail = this.createAnnotationRail(
          distributed.top,
          sourcePath,
          doc,
          "reading",
          "top",
          { tagName: railTagName }
        );
        const parentList =
          container.tagName === "LI" && container.parentElement
            ? container.parentElement
            : null;
        const previousListItem =
          container.previousElementSibling &&
          container.previousElementSibling.tagName === "LI"
            ? container.previousElementSibling
            : null;
        const isFirstListItem =
          parentList &&
          parentList.parentNode &&
          (parentList.tagName === "UL" || parentList.tagName === "OL") &&
          parentList.firstElementChild === container;
        if (isFirstListItem) {
          parentList.before(topRail);
          topRail.classList.add("va-list-edge-rail");
        } else if (previousListItem) {
          previousListItem.append(topRail);
          topRail.classList.add("va-list-between-rail");
        } else {
          container.prepend(topRail);
        }
        container._vaReadingRails.push(topRail);
      }
      if (distributed.bottom.length) {
        const bottomRail = this.createAnnotationRail(
          distributed.bottom,
          sourcePath,
          doc,
          "reading",
          "bottom",
          { tagName: railTagName }
        );
        container.append(bottomRail);
        container._vaReadingRails.push(bottomRail);
      }
    };

    // Markdown post-processors can run while Obsidian is still building a
    // detached list fragment. Mount once synchronously so the rails travel
    // with that fragment, then remeasure after it reaches the document.
    render();
    if (view && typeof view.requestAnimationFrame === "function") {
      const renderWhenMounted = (remainingFrames) => {
        view.requestAnimationFrame(() => {
          if (container.isConnected !== false) {
            render();
          } else if (remainingFrames > 1) {
            renderWhenMounted(remainingFrames - 1);
          }
        });
      };
      renderWhenMounted(8);
    } else {
      setTimeout(() => {
        if (container.isConnected !== false) render();
      }, 0);
    }
  }

  measureRenderedSourceFlow(annotations, sourceText) {
    const metrics = new Map();
    if (typeof sourceText !== "string" || !sourceText) return metrics;

    const sourceAnnotations = [];
    const regex = annotationRegex();
    let match;
    while ((match = regex.exec(sourceText)) !== null) {
      sourceAnnotations.push(annotationFromMatch(match));
    }
    const used = new Set();

    for (const element of annotations) {
      const identity = identityFromElement(element);
      let sourceIndex = -1;
      if (identity.id) {
        sourceIndex = sourceAnnotations.findIndex(
          (annotation, index) => !used.has(index) && annotation.id === identity.id
        );
      }
      if (sourceIndex === -1) {
        sourceIndex = sourceAnnotations.findIndex(
          (annotation, index) =>
            !used.has(index) &&
            annotation.text === identity.text &&
            annotation.note === identity.note &&
            annotation.color === identity.color
        );
      }
      if (sourceIndex === -1) continue;

      used.add(sourceIndex);
      const sourceAnnotation = sourceAnnotations[sourceIndex];
      const line = lineAtOffset(sourceText, sourceAnnotation.start);
      const anchorRatio = annotationAnchorOnLine(sourceText, line, sourceAnnotation);
      metrics.set(element, {
        anchorRatio,
        preferredSide: anchorRatio <= 0.5 ? "top" : "bottom"
      });
    }

    return metrics;
  }

  measureRenderedTarget(annotation, containerRect) {
    const rects = Array.from(annotation.getClientRects());
    const first = rects[0] || annotation.getBoundingClientRect();
    const last = rects[rects.length - 1] || first;
    const width = Math.max(containerRect.width, 1);
    const anchorRatio = Math.max(
      0.02,
      Math.min(0.98, (first.left + first.width / 2 - containerRect.left) / width)
    );
    const containerTop = Number(containerRect.top) || 0;
    const containerBottom =
      Number.isFinite(containerRect.bottom)
        ? containerRect.bottom
        : containerTop + (Number(containerRect.height) || 0);
    const firstTop = Number(first.top) || 0;
    const lastBottom =
      Number.isFinite(last.bottom) ? last.bottom : (Number(last.top) || 0) + (Number(last.height) || 0);
    const topDistance = Math.max(0, firstTop - containerTop);
    const bottomDistance = Math.max(0, containerBottom - lastBottom);
    return {
      anchorRatio,
      preferredSide: topDistance <= bottomDistance ? "top" : "bottom"
    };
  }

  measureRenderedTextFlow(annotation, container) {
    const targetText = annotation.textContent || "";
    const containerText = container.textContent || targetText;
    const totalLength = Math.max(containerText.length, targetText.length, 1);
    let beforeLength = Math.max(containerText.indexOf(targetText), 0);
    const doc = container.ownerDocument;

    if (doc && typeof doc.createRange === "function") {
      try {
        const range = doc.createRange();
        range.selectNodeContents(container);
        range.setEndBefore(annotation);
        beforeLength = range.toString().length;
      } catch (error) {
        // Fall back to text lookup when a renderer exposes a partial DOM.
      }
    }

    return Math.max(
      0.02,
      Math.min(0.98, (beforeLength + Math.max(targetText.length, 1) / 2) / totalLength)
    );
  }

  createAnnotationRail(annotations, sourcePath, doc, mode, placement = "top", options = {}) {
    const isEditable = mode === "editor";
    const rail = doc.createElement(options.tagName || "span");
    rail.className = `va-annotation-rail va-${mode}-rail va-side-${placement}`;
    rail.dataset.vaPlacement = placement;
    rail.dataset.vaMode = mode;
    rail.setAttribute("contenteditable", "false");
    rail.setAttribute("aria-label", "视觉批注栏");

    annotations.forEach((annotation, index) => {
      const item = doc.createElement("span");
      item.className = `va-rail-item va-color-${annotation.color}`;
      item.style.setProperty("--va-rotate", `${[-4, 3, -2, 4, -3][index % 5]}deg`);
      item.dataset.vaId = annotation.id || "";
      item.dataset.vaNote = annotation.note;
      item.dataset.vaText = annotation.text;
      item.dataset.vaAnchorRatio = String(annotation.anchorRatio ?? 0.5);
      item.style.setProperty("--va-anchor-ratio", String(annotation.anchorRatio ?? 0.5));
      item._vaTargetElement = annotation.targetElement || null;

      const noteButton = doc.createElement(isEditable ? "button" : "span");
      noteButton.className = "va-rail-note";
      if (isEditable) noteButton.type = "button";
      noteButton.title = `批注对象：${annotation.text}`;

      const noteText = doc.createElement("span");
      noteText.className = "va-rail-note-text";
      noteText.textContent = annotation.note;

      const arrow = doc.createElement("span");
      arrow.className = "va-rail-arrow";
      arrow.setAttribute("aria-hidden", "true");
      noteButton.append(noteText, arrow);

      item.append(noteButton);
      rail.append(item);

      if (isEditable) {
        const actions = doc.createElement("span");
        actions.className = "va-rail-actions";
        const edit = doc.createElement("button");
        edit.className = "va-rail-action";
        edit.type = "button";
        edit.textContent = "编辑";
        const remove = doc.createElement("button");
        remove.className = "va-rail-action va-rail-delete";
        remove.type = "button";
        remove.textContent = "删除";
        actions.append(edit, remove);
        item.append(actions);

        const select = (event) => {
          event.stopPropagation();
          rail.querySelectorAll(".va-rail-item.is-selected").forEach((node) => {
            node.classList.remove("is-selected");
          });
          item.classList.add("is-selected");
          if (annotation.targetElement) {
            this.selectRenderedAnnotation(annotation.targetElement, null);
          }
        };
        noteButton.addEventListener("click", select);
        edit.addEventListener("click", (event) => {
          event.stopPropagation();
          this.editRenderedAnnotation(sourcePath, annotation, item.ownerDocument);
        });
        remove.addEventListener("click", (event) => {
          event.stopPropagation();
          this.removeRenderedAnnotation(sourcePath, annotation);
        });
      }
    });
    if (isEditable) this.ensureEditorSelectionDismissal(doc);
    this.scheduleAnnotationRailLayout(rail, options.editorView || null);
    return rail;
  }

  ensureEditorSelectionDismissal(doc) {
    if (!this._vaDismissDocuments) this._vaDismissDocuments = new WeakSet();
    if (this._vaDismissDocuments.has(doc)) return;
    this._vaDismissDocuments.add(doc);

    this.registerDomEvent(doc, "pointerdown", (event) => {
      const target = event.target;
      if (
        target &&
        typeof target.closest === "function" &&
        target.closest(".va-annotation, .va-rail-item")
      ) {
        return;
      }
      this.clearRenderedSelection(doc);
    });
    this.registerDomEvent(doc, "keydown", (event) => {
      if (event.key === "Escape") this.clearRenderedSelection(doc);
    });
  }

  scheduleAnnotationRailLayout(rail, editorView = null) {
    const view = rail.ownerDocument.defaultView;
    const run = () => {
      const previousHeight = rail.style.height;
      this.layoutAnnotationRail(rail);
      if (
        editorView &&
        rail.style.height !== previousHeight &&
        typeof editorView.requestMeasure === "function"
      ) {
        editorView.requestMeasure();
        const settle = () => this.layoutAnnotationRail(rail);
        if (view && typeof view.requestAnimationFrame === "function") {
          // CodeMirror applies the requested block-height measurement on its
          // next animation frame. Re-read the target rect afterwards so the
          // connector is calibrated against the prose's settled position.
          view.requestAnimationFrame(settle);
        } else {
          setTimeout(settle, 0);
        }
      }
    };
    if (view && typeof view.requestAnimationFrame === "function") {
      view.requestAnimationFrame(run);
    } else {
      setTimeout(run, 0);
    }
    const fonts = rail.ownerDocument.fonts;
    if (fonts && fonts.ready && typeof fonts.ready.then === "function") {
      fonts.ready.then(run).catch(() => {});
    }
    const ResizeObserverClass = view && view.ResizeObserver;
    if (typeof ResizeObserverClass === "function") {
      let lastWidth = 0;
      const observer = new ResizeObserverClass((entries) => {
        if (!rail.isConnected) return;
        const width = entries[0] ? entries[0].contentRect.width : rail.getBoundingClientRect().width;
        if (Math.abs(width - lastWidth) < 0.5) return;
        lastWidth = width;
        run();
      });
      observer.observe(rail);
      rail._vaResizeObserver = observer;
    }
  }

  findRenderedTarget(item, railRect) {
    if (item._vaTargetElement && item._vaTargetElement.isConnected !== false) {
      return item._vaTargetElement;
    }
    const candidates = Array.from(item.ownerDocument.querySelectorAll(".va-annotation")).filter(
      (node) => {
        const idMatches = item.dataset.vaId && node.getAttribute("data-va-id") === item.dataset.vaId;
        const legacyMatches =
          !item.dataset.vaId &&
          node.getAttribute("data-va-note") === item.dataset.vaNote &&
          node.textContent === item.dataset.vaText;
        return idMatches || legacyMatches;
      }
    );
    if (!candidates.length) return null;
    const railCenter = railRect.top + railRect.height / 2;
    return candidates.sort((a, b) => {
      const aRect = a.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();
      return (
        Math.abs(aRect.top + aRect.height / 2 - railCenter) -
        Math.abs(bRect.top + bRect.height / 2 - railCenter)
      );
    })[0];
  }

  rotatedRectVerticalBoundsAtX(rect, angle, connectorX) {
    if (
      !rect ||
      !Number.isFinite(connectorX) ||
      !Number.isFinite(rect.left) ||
      !Number.isFinite(rect.top)
    ) {
      return null;
    }
    const rectWidth = Number(rect.width) || Number(rect.right) - Number(rect.left);
    const rectHeight = Number(rect.height) || Number(rect.bottom) - Number(rect.top);
    if (!(rectWidth > 0) || !(rectHeight > 0)) return null;

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const absCos = Math.abs(cos);
    const absSin = Math.abs(sin);
    const determinant = absCos * absCos - absSin * absSin;
    if (Math.abs(determinant) < 0.05) {
      if (connectorX < rect.left || connectorX > rect.right) return null;
      return { top: rect.top, bottom: rect.bottom };
    }

    // Range rectangles are axis-aligned bounds after CSS transforms. Recover
    // the line box's rotated quadrilateral so we can measure its boundary at
    // the connector's actual x coordinate instead of using a far-away corner.
    const boxWidth =
      (rectWidth * absCos - rectHeight * absSin) / determinant;
    const boxHeight =
      (rectHeight * absCos - rectWidth * absSin) / determinant;
    if (!(boxWidth > 0) || !(boxHeight > 0)) {
      if (connectorX < rect.left || connectorX > rect.right) return null;
      return { top: rect.top, bottom: rect.bottom };
    }

    const centerX = rect.left + rectWidth / 2;
    const centerY = rect.top + rectHeight / 2;
    const corners = [
      [-boxWidth / 2, -boxHeight / 2],
      [boxWidth / 2, -boxHeight / 2],
      [boxWidth / 2, boxHeight / 2],
      [-boxWidth / 2, boxHeight / 2]
    ].map(([x, y]) => ({
      x: centerX + x * cos - y * sin,
      y: centerY + x * sin + y * cos
    }));
    const intersections = [];
    for (let index = 0; index < corners.length; index += 1) {
      const start = corners[index];
      const end = corners[(index + 1) % corners.length];
      const minX = Math.min(start.x, end.x) - 0.25;
      const maxX = Math.max(start.x, end.x) + 0.25;
      if (connectorX < minX || connectorX > maxX) continue;
      const deltaX = end.x - start.x;
      if (Math.abs(deltaX) < 0.001) {
        if (Math.abs(connectorX - start.x) <= 0.25) {
          intersections.push(start.y, end.y);
        }
        continue;
      }
      const ratio = (connectorX - start.x) / deltaX;
      if (ratio >= -0.001 && ratio <= 1.001) {
        intersections.push(start.y + (end.y - start.y) * ratio);
      }
    }
    if (intersections.length < 2) return null;
    return {
      top: Math.min(...intersections),
      bottom: Math.max(...intersections)
    };
  }

  measureNoteBoundaryAtX(noteText, connectorX, isTop) {
    if (!noteText) return null;
    const doc = noteText.ownerDocument;
    const view = doc && doc.defaultView;
    let angle = 0;
    try {
      const transform =
        view && typeof view.getComputedStyle === "function"
          ? view.getComputedStyle(noteText).transform
          : "";
      const matrixMatch =
        typeof transform === "string" &&
        transform.match(/^matrix\(([^)]+)\)$/);
      const matrix3dMatch =
        typeof transform === "string" &&
        transform.match(/^matrix3d\(([^)]+)\)$/);
      const values = matrixMatch
        ? matrixMatch[1].split(",").map(Number)
        : matrix3dMatch
          ? matrix3dMatch[1].split(",").map(Number)
          : [];
      if (values.length >= 2 && values.every(Number.isFinite)) {
        angle = Math.atan2(values[1], values[0]);
      }
    } catch (error) {
      // A partial test DOM may not expose computed styles.
    }

    let lineRects = [];
    try {
      if (doc && typeof doc.createRange === "function") {
        const range = doc.createRange();
        range.selectNodeContents(noteText);
        lineRects = Array.from(range.getClientRects());
        if (typeof range.detach === "function") range.detach();
      }
    } catch (error) {
      // Fall back to the element rectangle below.
    }
    if (!lineRects.length && typeof noteText.getBoundingClientRect === "function") {
      lineRects = [noteText.getBoundingClientRect()];
    }

    const connectorSamples = [connectorX - 2, connectorX, connectorX + 2];
    const bounds = lineRects.flatMap((rect) =>
      connectorSamples
        .map((sampleX) =>
          this.rotatedRectVerticalBoundsAtX(rect, angle, sampleX)
        )
        .filter(Boolean)
    );
    if (!bounds.length) return null;
    return isTop
      ? Math.max(...bounds.map((bound) => bound.bottom))
      : Math.min(...bounds.map((bound) => bound.top));
  }

  layoutAnnotationRail(rail) {
    if (!rail.isConnected) return;
    const railRect = rail.getBoundingClientRect();
    if (!railRect.width) return;
    const isTop = rail.dataset.vaPlacement !== "bottom";
    const edgeGap = 4;
    const entries = Array.from(rail.querySelectorAll(".va-rail-item")).map((item) => {
      let ratio = Number(item.dataset.vaAnchorRatio || 0.5);
      const itemRect = item.getBoundingClientRect();
      const target = this.findRenderedTarget(item, railRect);
      let desiredX = ratio * itemRect.width;
      if (target) {
        const rects = Array.from(target.getClientRects());
        const targetRect =
          (isTop ? rects[0] : rects[rects.length - 1]) || target.getBoundingClientRect();
        desiredX = targetRect.left + targetRect.width / 2 - itemRect.left;
      }
      const marker = item.querySelector(".va-rail-note");
      const markerRect = marker ? marker.getBoundingClientRect() : null;
      const noteText = item.querySelector(".va-rail-note-text");
      const noteTextRect = noteText ? noteText.getBoundingClientRect() : null;
      const noteTextHeight = noteText
        ? Math.max(
            Number(noteText.offsetHeight) || 0,
            noteTextRect ? noteTextRect.height : 0
          )
        : 0;
      const topVisualOverflow =
        isTop &&
        markerRect &&
        noteTextRect &&
        Number.isFinite(markerRect.top) &&
        Number.isFinite(noteTextRect.top)
          ? Math.max(0, markerRect.top - noteTextRect.top)
          : 0;
      const markerWidth = Math.min(
        markerRect ? markerRect.width : 0,
        itemRect.width
      );
      const markerHalf = markerWidth / 2;
      const markerX = Math.max(markerHalf, Math.min(itemRect.width - markerHalf, desiredX));
      return {
        item,
        target,
        noteText,
        markerX,
        arrowShift: desiredX - markerX,
        left: markerX - markerHalf,
        right: markerX + markerHalf,
        textHeight: noteTextHeight,
        topVisualOverflow,
        height: Math.max(noteTextHeight + 38, 68)
      };
    });

    entries.sort((a, b) => a.left - b.left);
    const laneEnds = [];
    const horizontalGap = 20;
    for (const entry of entries) {
      let lane = laneEnds.findIndex((right) => entry.left >= right + horizontalGap);
      if (lane === -1) lane = laneEnds.length;
      laneEnds[lane] = entry.right;
      entry.lane = lane;
    }

    const laneCount = Math.max(laneEnds.length, 1);
    const laneHeight = Math.max(72, ...entries.map((entry) => entry.height + 4));
    const railHeight = laneCount * laneHeight + edgeGap * 2;
    rail.style.height = `${railHeight}px`;
    rail.style.minHeight = `${railHeight}px`;

    for (const entry of entries) {
      const displayLane = isTop ? laneCount - 1 - entry.lane : entry.lane;
      const connectorExtra = isTop
        ? (laneCount - 1 - displayLane) * laneHeight
        : displayLane * laneHeight;
      const arrowLength = isTop
        ? Math.max(
            38,
            laneHeight - entry.textHeight + edgeGap + connectorExtra
          )
        : 38 + connectorExtra + edgeGap;
      const connectorOffset = isTop ? 0 : -(connectorExtra + edgeGap);
      entry.arrowLength = arrowLength;
      entry.connectorOffset = connectorOffset;
      entry.item.dataset.vaLane = String(displayLane);
      entry.item.style.setProperty("--va-marker-x", `${entry.markerX}px`);
      entry.item.style.setProperty("--va-arrow-shift", `${entry.arrowShift}px`);
      entry.item.style.setProperty("--va-arrow-length", `${arrowLength}px`);
      entry.item.style.setProperty(
        "--va-connector-offset",
        `${connectorOffset}px`
      );
      entry.item.style.setProperty(
        "--va-lane-y",
        `${edgeGap + displayLane * laneHeight + entry.topVisualOverflow}px`
      );
    }

    // Theme margins, list indentation, and CodeMirror block spacing all sit
    // outside the rail itself. Measure the final rendered target after the
    // rail height is committed, then extend only the target-facing end of the
    // connector. This gives Reading and Editing view the same visible gap
    // without moving the handwritten label or reducing its safety space.
    const targetGap = 5;
    const labelGap = 6;
    const connectorCorrections = [];
    for (const entry of entries) {
      const arrow = entry.item.querySelector(".va-rail-arrow");
      if (!arrow) continue;
      const arrowRect = arrow.getBoundingClientRect();
      const connectorX = arrowRect.left + arrowRect.width / 2;
      const noteBoundary = this.measureNoteBoundaryAtX(
        entry.noteText,
        connectorX,
        isTop
      );
      const requestedLabelGap = Number.isFinite(noteBoundary)
        ? isTop
          ? noteBoundary + labelGap - arrowRect.top
          : arrowRect.bottom + labelGap - noteBoundary
        : labelGap;
      let adjustedLength = entry.arrowLength;
      let adjustedOffset = entry.connectorOffset;

      if (entry.target) {
        const targetRects = Array.from(entry.target.getClientRects());
        const targetRect =
          (isTop ? targetRects[0] : targetRects[targetRects.length - 1]) ||
          entry.target.getBoundingClientRect();
        if (
          isTop &&
          Number.isFinite(targetRect.top) &&
          Number.isFinite(arrowRect.bottom)
        ) {
          const rawExtension = targetRect.top - targetGap - arrowRect.bottom;
          const extension = Math.round(
            Math.max(38 - entry.arrowLength, Math.min(160, rawExtension)) * 2
          ) / 2;
          adjustedLength = entry.arrowLength + extension;
        } else if (
          !isTop &&
          Number.isFinite(targetRect.bottom) &&
          Number.isFinite(arrowRect.top)
        ) {
          const rawExtension = arrowRect.top - (targetRect.bottom + targetGap);
          const extension = Math.round(
            Math.max(38 - entry.arrowLength, Math.min(160, rawExtension)) * 2
          ) / 2;
          adjustedLength = entry.arrowLength + extension;
          adjustedOffset = entry.connectorOffset - extension;
        }
      }
      const maxLabelGap = Math.max(labelGap, adjustedLength - 8);
      const adjustedLabelGap =
        Math.round(
          Math.max(labelGap, Math.min(maxLabelGap, requestedLabelGap)) * 2
        ) / 2;
      connectorCorrections.push({
        entry,
        adjustedLength,
        adjustedOffset,
        adjustedLabelGap
      });
    }
    for (const correction of connectorCorrections) {
      correction.entry.item.style.setProperty(
        "--va-arrow-length",
        `${correction.adjustedLength}px`
      );
      correction.entry.item.style.setProperty(
        "--va-connector-offset",
        `${correction.adjustedOffset}px`
      );
      correction.entry.item.style.setProperty(
        "--va-label-arrow-gap",
        `${correction.adjustedLabelGap}px`
      );
    }
  }

  selectRenderedAnnotation(annotation, callout) {
    const doc = annotation.ownerDocument;
    doc.querySelectorAll(".va-annotation.is-selected").forEach((node) => {
      node.removeClass("is-selected");
      node.setAttribute("aria-selected", "false");
    });
    doc.querySelectorAll(".va-rail-item.is-selected").forEach((node) => {
      node.classList.remove("is-selected");
    });
    annotation.addClass("is-selected");
    annotation.setAttribute("aria-selected", "true");
    const identity = identityFromElement(annotation);
    doc.querySelectorAll(".va-rail-item").forEach((item) => {
      const idMatches = identity.id && item.dataset.vaId === identity.id;
      const legacyMatches =
        !identity.id &&
        item.dataset.vaNote === identity.note &&
        item.dataset.vaText === identity.text;
      if (idMatches || legacyMatches) item.classList.add("is-selected");
    });
  }

  clearRenderedSelection(doc) {
    if (!doc || typeof doc.querySelectorAll !== "function") return;
    doc.querySelectorAll(".va-annotation.is-selected").forEach((node) => {
      node.classList.remove("is-selected");
      node.setAttribute("aria-selected", "false");
    });
    doc.querySelectorAll(".va-rail-item.is-selected").forEach((node) => {
      node.classList.remove("is-selected");
    });
  }

  showRenderedAnnotationMenu(event, sourcePath, identity, selectionDoc = null) {
    const menu = new Menu();
    menu.addItem((item) =>
      item
        .setTitle("编辑批注")
        .setIcon("pencil")
        .onClick(() => this.editRenderedAnnotation(sourcePath, identity, selectionDoc))
    );
    menu.addItem((item) =>
      item
        .setTitle("删除批注（保留正文）")
        .setIcon("eraser")
        .onClick(() => this.removeRenderedAnnotation(sourcePath, identity))
    );
    menu.showAtMouseEvent(event);
  }

  async editRenderedAnnotation(sourcePath, identity, selectionDoc = null) {
    const file = this.app.vault.getAbstractFileByPath(sourcePath);
    if (!file) {
      new Notice("找不到批注所在文档");
      return;
    }
    const source = await this.app.vault.read(file);
    const annotation = findAnnotationByIdentity(source, identity);
    if (!annotation) {
      new Notice("找不到所选批注，请重新打开文档后再试");
      return;
    }

    new AnnotationModal(
      this.app,
      {
        editing: true,
        text: annotation.text,
        note: annotation.note,
        color: annotation.color,
        placement: "auto"
      },
      async ({ note, color }) => {
        this.clearRenderedSelection(selectionDoc);
        let changed = false;
        await this.app.vault.process(file, (currentSource) => {
          const current = findAnnotationByIdentity(currentSource, identity);
          if (!current) return currentSource;
          const replacement = buildAnnotation(
            current.text,
            note,
            color,
            "auto",
            current.id || createAnnotationId()
          );
          changed = true;
          return (
            currentSource.slice(0, current.start) + replacement + currentSource.slice(current.end)
          );
        });
        new Notice(changed ? "视觉批注已更新" : "批注已发生变化，请重新选择");
      }
    ).open();
  }

  async removeRenderedAnnotation(sourcePath, identity) {
    const file = this.app.vault.getAbstractFileByPath(sourcePath);
    if (!file) {
      new Notice("找不到批注所在文档");
      return;
    }
    let changed = false;
    await this.app.vault.process(file, (source) => {
      const annotation = findAnnotationByIdentity(source, identity);
      if (!annotation) return source;
      changed = true;
      return source.slice(0, annotation.start) + annotation.text + source.slice(annotation.end);
    });
    new Notice(changed ? "批注已删除，正文已保留" : "批注已发生变化，请重新选择");
  }
};

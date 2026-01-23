import React, { useRef } from "react";
import {
    EditableTitle,
    ToggleSwitch,
    SectionCard,
} from "../../../dashboard-elements";
import { Tooltip } from "../../../ui";
import { RumpusQuill } from "../../../ui";
// import RumpusQuill from "../../rumpus-quill/rumpus-quill";

export default function AboutSection({
    section,
    onToggle,
    onToggleTitle,
    onUpdateTitle,
    onUpdate,
}) {
    const aboutRef = useRef(null);

    return (
        <SectionCard
            title={
                <EditableTitle
                    value={section.title}
                    defaultValue={section.defaultTitle}
                    onChange={onUpdateTitle}
                />
            }
            headerActions={
                <Tooltip text="Show or hide this section’s title in the preview">
                    <div className="is-flex is-flex-direction-column is-align-items-center ml-3">
                        <ToggleSwitch
                            checked={section.showTitle}
                            color="is-info"
                            onChange={onToggleTitle}
                        />
                    </div>
                </Tooltip>
            }
            enabled={section.enabled}
            onToggle={onToggle}
        >
            <RumpusQuill
                ref={aboutRef}
                value={section.data.content}
                setValue={(val) => onUpdate({ content: val })}
                placeholder="Write your bio..."
            />

            {/* Editor Controls */}
            <div className="mt-2">
                <Tooltip text="Clear the contents of the editor">
                    <button
                        type="button"
                        className="button is-danger is-light is-small"
                        onClick={() => {
                            const editor = aboutRef.current?.getEditor?.();
                            if (editor) {
                                editor.setContents("");
                            }
                            onUpdate({ content: "" });
                        }}
                    >
                        Clear
                    </button>
                </Tooltip>

                <Tooltip text="Undo the last change">
                    <button
                        type="button"
                        className="button is-light is-small ml-2"
                        onClick={() => {
                            const editor = aboutRef.current?.getEditor?.();
                            editor?.history.undo();
                        }}
                    >
                        Undo
                    </button>
                </Tooltip>

                <Tooltip text="Redo the last undone change">
                    <button
                        type="button"
                        className="button is-light is-small ml-1"
                        onClick={() => {
                            const editor = aboutRef.current?.getEditor?.();
                            if (editor) {
                                editor.history.redo();
                                onUpdate({ content: editor.root.innerHTML });
                            }
                        }}
                    >
                        Redo
                    </button>
                </Tooltip>
            </div>
        </SectionCard>
    );
}

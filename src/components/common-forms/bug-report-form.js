import React, { useState, useRef } from 'react';
import { getApi } from '../../api';
import logger from '../../logger';
import { RumpusQuill, RumpusQuillForm } from '../ui';

export default function BugReportForm({
    endpoint,
    onSuccess,
    titlePlaceholder = 'Title',
    bodyPlaceholder = 'Describe the bug...',
    fields = []
}) {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const extraState = fields.reduce((acc, field) => {
        acc[field.name] = field.defaultValue || '';
        return acc;
    }, {});
    const [extraFields, setExtraFields] = useState(extraState);

    const editorRef = useRef(null);

    const handleChangeExtra = (name, value) => {
        setExtraFields((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const api = getApi();
            const payload = { title, body, ...extraFields };
            const res = await api.post(endpoint, payload);

            logger.info('Form submitted successfully', res.data);

            // Reset form
            setTitle('');
            setBody('');
            setExtraFields(extraState);
            if (editorRef.current) editorRef.current.getEditor().setContents('');

            if (onSuccess) onSuccess(res.data);
        } catch (err) {
            logger.error('Failed to submit form:', err.message);
            if (err.response) {
                logger.debug('API error response:', {
                    status: err.response.status,
                    data: err.response.data,
                });
            }
            setError('Failed to submit form. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <RumpusQuillForm>
            <form onSubmit={handleSubmit}>
                {/* Title */}
                <div className="field">
                    <label className="label">{titlePlaceholder}</label>
                    <div className="control">
                        <input
                            className="input"
                            type="text"
                            placeholder={titlePlaceholder}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                </div>

                {/* Body */}
                <div className="field">
                    <label className="label">Body</label>
                    <div className="control">
                        <RumpusQuill
                            value={body}
                            setValue={setBody}
                            editor_ref={editorRef}
                            placeholder={bodyPlaceholder}
                        />
                    </div>
                </div>

                {/* Extra Fields */}
                {fields.map((field) => (
                    <div className="field" key={field.name}>
                        <label className="label">{field.label}</label>
                        <div className="control">
                            {field.type === 'select' && field.options ? (
                                <div className="select">
                                    <select
                                        value={extraFields[field.name]}
                                        onChange={(e) => handleChangeExtra(field.name, e.target.value)}
                                    >
                                        {field.options.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <input
                                    className="input"
                                    type={field.type || 'text'}
                                    value={extraFields[field.name]}
                                    onChange={(e) => handleChangeExtra(field.name, e.target.value)}
                                />
                            )}
                        </div>
                    </div>
                ))}

                {/* Submit */}
                <div className="field">
                    <div className="control">
                        <button className="button is-link" type="submit" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </div>

                {error && <p className="help is-danger">{error}</p>}
            </form>
        </RumpusQuillForm>
    );
}

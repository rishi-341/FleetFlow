import React from 'react';

export const StatusPill = ({ status }) => {
    const map = {
        Available: 'pill-available',
        'On Trip': 'pill-on-trip',
        'In Shop': 'pill-in-shop',
        'Out of Service': 'pill-retired',
        'Off Duty': 'pill-off-duty',
        'On Duty': 'pill-on-duty',
        Suspended: 'pill-suspended',
        Draft: 'pill-draft',
        Dispatched: 'pill-dispatched',
        Completed: 'pill-completed',
        Cancelled: 'pill-cancelled',
        Ongoing: 'pill-in-shop',
    };
    return <span className={`status-pill ${map[status] || 'pill-default'}`}>{status}</span>;
};

export const PageHeader = ({ title, subtitle, children }) => (
    <div className="page-header">
        <div>
            <h1 className="page-title">{title}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        <div className="page-actions">{children}</div>
    </div>
);

// icon = FA class string e.g. "fa-solid fa-truck"
export const KPICard = ({ label, value, sub, icon }) => (
    <div className="kpi-card">
        <div className="kpi-icon">
            <i className={icon}></i>
        </div>
        <div className="kpi-body">
            <div className="kpi-value">{value}</div>
            <div className="kpi-label">{label}</div>
            {sub && <div className="kpi-sub">{sub}</div>}
        </div>
    </div>
);

export const Table = ({ headers, children, empty = 'No records found.' }) => (
    <div className="table-wrapper">
        <table className="data-table">
            <thead>
                <tr>
                    {headers.map((h) => <th key={h}>{h}</th>)}
                </tr>
            </thead>
            <tbody>
                {React.Children.count(children) === 0 ? (
                    <tr><td colSpan={headers.length} className="empty-cell">{empty}</td></tr>
                ) : children}
            </tbody>
        </table>
    </div>
);

export const Modal = ({ title, onClose, children }) => (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
                <h2>{title}</h2>
                <button className="modal-close" onClick={onClose}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div className="modal-body">{children}</div>
        </div>
    </div>
);

export const FormGroup = ({ label, children, error }) => (
    <div className="form-group">
        <label className="form-label">{label}</label>
        {children}
        {error && <span className="form-error">{error}</span>}
    </div>
);

export const Alert = ({ type = 'error', message }) =>
    message ? <div className={`alert alert-${type}`}>{message}</div> : null;

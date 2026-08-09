import React from 'react';

const POCards = ({ data = [], onFilter = () => { } }) => {
  const total = data.length;
  const draft = data.filter(d => d.status === 'Draft').length;
  const issued = data.filter(d => d.status === 'Issued').length;
  const partially = data.filter(d => d.status === 'Partially Delivered').length;
  const delivered = data.filter(d => d.status === 'Completed').length;
  const cancelled = data.filter(d => d.status === 'Cancelled').length;
  const totalValue = data.reduce((s, d) => s + (d.totalAmount || 0), 0);
  const outstanding = data.reduce((s, d) => s + ((d.totalAmount || 0) - (d.amountDelivered || 0)), 0);

  const card = (label, value, keyFilter) => (
    <div className="stat-card" onClick={() => onFilter({ status: keyFilter })} role="button">
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value}</div>
    </div>
  );

  return (
    <div className="dashboard-stats-row">
      {card('Total POs', total, null)}
      {card('Draft', draft, 'Draft')}
      {card('Issued', issued, 'Issued')}
      {card('Partially Delivered', partially, 'Partially Delivered')}
      {card('Completed', delivered, 'Completed')}
      {card('Cancelled', cancelled, 'Cancelled')}
      {card('Total PO Value', `KES ${totalValue.toFixed(2)}`, null)}
      {card('Outstanding Value', `KES ${outstanding.toFixed(2)}`, null)}
    </div>
  );
};

export default POCards;

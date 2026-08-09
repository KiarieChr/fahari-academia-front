// Mock procurement Purchase Order service
const mockPOs = [
  {
    id: 'po-001',
    poNumber: 'PO-2026-001',
    requisitionNumber: 'REQ-1001',
    supplierName: 'ABC Supplies Ltd',
    poDate: '2026-01-15',
    expectedDelivery: '2026-02-10',
    totalAmount: 250000,
    amountDelivered: 50000,
    paymentStatus: 'Partial',
    status: 'Partially Delivered'
  },
  {
    id: 'po-002',
    poNumber: 'PO-2026-002',
    requisitionNumber: 'REQ-1002',
    supplierName: 'School Furnishings',
    poDate: '2026-01-20',
    expectedDelivery: '2026-03-01',
    totalAmount: 120000,
    amountDelivered: 0,
    paymentStatus: 'Unpaid',
    status: 'Issued'
  }
];

const list = async () => {
  // Simulate API call
  return new Promise(resolve => setTimeout(() => resolve([...mockPOs]), 150));
};

const get = async (id) => {
  return new Promise(resolve => setTimeout(() => resolve(mockPOs.find(p=>p.id===id)), 100));
};

const create = async (payload) => {
  const newPo = { id: `po-${Date.now()}`, poNumber: `PO-2026-${Math.floor(Math.random()*900)+100}`, ...payload };
  mockPOs.unshift(newPo);
  return new Promise(resolve => setTimeout(() => resolve(newPo), 120));
};

export default { list, get, create };

export interface PortfolioVendor {
  id: number;
  name: string;
  category: string;
  activeContracts: number;
  region: string;
}

export interface PortfolioStakeholder {
  id: number;
  name: string;
  role: string;
  organization: string;
}

export interface ProjectVendor {
  id: number;
  name: string;
  category: string;
  status: 'Active' | 'Pending' | 'On Hold';
}

export interface ProjectContract {
  id: number;
  title: string;
  vendor: string;
  amount: number;
  status: 'Draft' | 'Active' | 'Completed';
}

export interface ProjectTransaction {
  id: number;
  title: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Paid';
  date: string;
}

export interface PortfolioProject {
  id: number;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: string;
  vendors: ProjectVendor[];
  contracts: ProjectContract[];
  transactions: ProjectTransaction[];
}

export const MOCK_PROJECTS: PortfolioProject[] = [
  {
    id: 101,
    name: 'Harbor Point Tower',
    description: 'Mixed-use high-rise focused on premium residential units.',
    location: 'Karachi',
    startDate: '2025-11-01',
    endDate: '2027-03-15',
    budget: 1250000,
    status: 'In Progress',
    vendors: [
      { id: 1, name: 'Civic Build Co.', category: 'General Contractor', status: 'Active' },
      { id: 2, name: 'Ironline Steelworks', category: 'Structural Steel', status: 'Active' }
    ],
    contracts: [
      { id: 5001, title: 'Structural Works', vendor: 'Ironline Steelworks', amount: 320000, status: 'Active' },
      { id: 5002, title: 'Core & Shell', vendor: 'Civic Build Co.', amount: 540000, status: 'Active' }
    ],
    transactions: [
      { id: 9001, title: 'Steel Fabrication Milestone', amount: 85000, status: 'Paid', date: '2026-02-12' },
      { id: 9002, title: 'Concrete Pour - Phase 2', amount: 54000, status: 'Approved', date: '2026-03-05' }
    ]
  },
  {
    id: 102,
    name: 'Lakeside Residences',
    description: 'Mid-rise residential blocks with lakeside amenities.',
    location: 'Lahore',
    startDate: '2026-02-10',
    endDate: '2027-08-30',
    budget: 820000,
    status: 'Planning',
    vendors: [
      { id: 3, name: 'GreenPath MEP', category: 'MEP', status: 'Pending' }
    ],
    contracts: [
      { id: 5101, title: 'Site Prep & Surveys', vendor: 'GreenPath MEP', amount: 42000, status: 'Draft' }
    ],
    transactions: []
  },
  {
    id: 103,
    name: 'Crescent Mall Retrofit',
    description: 'Energy retrofit and interior modernization program.',
    location: 'Islamabad',
    startDate: '2025-07-18',
    endDate: '2026-11-20',
    budget: 460000,
    status: 'On Hold',
    vendors: [
      { id: 4, name: 'Summit Glass & Facade', category: 'Facade', status: 'On Hold' }
    ],
    contracts: [
      { id: 5201, title: 'Facade Upgrade', vendor: 'Summit Glass & Facade', amount: 120000, status: 'Draft' }
    ],
    transactions: [
      { id: 9101, title: 'Facade Design Deposit', amount: 15000, status: 'Pending', date: '2026-01-22' }
    ]
  }
];

export const MOCK_VENDORS: PortfolioVendor[] = [
  { id: 1, name: 'Civic Build Co.', category: 'General Contractor', activeContracts: 2, region: 'Karachi' },
  { id: 2, name: 'Ironline Steelworks', category: 'Structural Steel', activeContracts: 1, region: 'Karachi' },
  { id: 3, name: 'GreenPath MEP', category: 'MEP', activeContracts: 1, region: 'Lahore' },
  { id: 4, name: 'Summit Glass & Facade', category: 'Facade', activeContracts: 1, region: 'Islamabad' }
];

export const MOCK_STAKEHOLDERS: PortfolioStakeholder[] = [
  { id: 1, name: 'Aisha Khan', role: 'Sponsor', organization: 'Harbor Capital' },
  { id: 2, name: 'Raza Siddiqui', role: 'Lender', organization: 'Urban Bank' },
  { id: 3, name: 'Nadia Rahman', role: 'Owner Rep', organization: 'Lakeside Holdings' },
  { id: 4, name: 'Imran Qureshi', role: 'Asset Manager', organization: 'Crescent Retail Group' }
];

export function getMockProjectById(id: number): PortfolioProject | null {
  return MOCK_PROJECTS.find((project) => project.id === id) ?? null;
}

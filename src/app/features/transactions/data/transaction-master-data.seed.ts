import { Category, Item, Stage, SubCategory } from '../models/transaction-master-data.models';

export const CATEGORY_SEED: Category[] = [
  { id: 'design-approvals', name: 'Design and Approvals' },
  { id: 'boring', name: 'Boring' },
  { id: 'earthwork', name: 'Earthwork' },
  { id: 'site', name: 'Site' },
  { id: 'structure', name: 'Structure' },
  { id: 'electric', name: 'Electric' },
  { id: 'steelworks', name: 'Steelworks' },
  { id: 'plumbing', name: 'Plumbing' },
  { id: 'chemical', name: 'Chemical' },
  { id: 'plaster', name: 'Plaster' },
  { id: 'tile-marble', name: 'Tile-Marble' },
  { id: 'woodwork', name: 'Woodwork' },
  { id: 'false-ceiling', name: 'FalseCeiling' },
  { id: 'aluminum-glass', name: 'AluminumGlass' },
  { id: 'furnishing', name: 'Furnishing' },
  { id: 'polishing', name: 'Polishing' },
  { id: 'paintwork', name: 'Paintwork' }
];

export const SUB_CATEGORY_SEED: SubCategory[] = [
  { id: 'design-drawings', categoryId: 'design-approvals', name: 'Drawings Set' },
  { id: 'design-docs', categoryId: 'design-approvals', name: 'Documentation' },
  { id: 'design-fees', categoryId: 'design-approvals', name: 'Fees' },

  { id: 'boring-contract', categoryId: 'boring', name: 'Contract' },
  { id: 'boring-labour', categoryId: 'boring', name: 'Labour' },

  { id: 'earth-manual-excavation', categoryId: 'earthwork', name: 'Manual Excavation' },
  { id: 'earth-moving', categoryId: 'earthwork', name: 'Earth Moving' },
  { id: 'earth-loader-levelling', categoryId: 'earthwork', name: 'Loader Levelling' },
  { id: 'earth-water-tanker', categoryId: 'earthwork', name: 'Water Tanker' },

  { id: 'site-clearing', categoryId: 'site', name: 'Clearing' },
  { id: 'site-demolition', categoryId: 'site', name: 'Demolition' },
  { id: 'site-guard-salary', categoryId: 'site', name: 'Guard Salary' },
  { id: 'site-store', categoryId: 'site', name: 'Store' },

  { id: 'structure-contract', categoryId: 'structure', name: 'Contract' },
  { id: 'structure-brickwork', categoryId: 'structure', name: 'Brickwork' },
  { id: 'structure-shuttering', categoryId: 'structure', name: 'Shuttering' },
  { id: 'structure-carriage', categoryId: 'structure', name: 'Carriage' },
  { id: 'structure-loading', categoryId: 'structure', name: 'Loading' },
  { id: 'structure-labour', categoryId: 'structure', name: 'Labour' },

  { id: 'electric-wiring', categoryId: 'electric', name: 'Wiring' },
  { id: 'electric-electricity', categoryId: 'electric', name: 'Electricity' },
  { id: 'electric-fittings', categoryId: 'electric', name: 'Fittings' },

  { id: 'steelworks-contract', categoryId: 'steelworks', name: 'Contract' },
  { id: 'steelworks-labour', categoryId: 'steelworks', name: 'Labour' },
  { id: 'steelworks-grating', categoryId: 'steelworks', name: 'Grating' },

  { id: 'plumbing-gi-fittings', categoryId: 'plumbing', name: 'GI Fittings' },
  { id: 'plumbing-fittings', categoryId: 'plumbing', name: 'Fittings' },
  { id: 'plumbing-water-tanker', categoryId: 'plumbing', name: 'Water Tanker' },

  { id: 'chemical-termite', categoryId: 'chemical', name: 'Termite Spray' },

  { id: 'plaster-contract', categoryId: 'plaster', name: 'Contract' },
  { id: 'plaster-labour', categoryId: 'plaster', name: 'Labour' },

  { id: 'tile-cutting', categoryId: 'tile-marble', name: 'Tiles cutting' },
  { id: 'tile-chips', categoryId: 'tile-marble', name: 'Chips' },
  { id: 'tile-carriage', categoryId: 'tile-marble', name: 'Carriage' },

  { id: 'wood-cutting', categoryId: 'woodwork', name: 'Wood Cutting' },
  { id: 'wood-sheet', categoryId: 'woodwork', name: 'Wood Sheet' },
  { id: 'wood-contract', categoryId: 'woodwork', name: 'Contract' },

  { id: 'false-contract', categoryId: 'false-ceiling', name: 'Contract' },
  { id: 'false-sheet-cutting', categoryId: 'false-ceiling', name: 'Sheet Cutting' },

  { id: 'aluminum-work', categoryId: 'aluminum-glass', name: 'Aluminum' },

  { id: 'furnishing-appliances', categoryId: 'furnishing', name: 'Appliances' },

  { id: 'polishing-contract', categoryId: 'polishing', name: 'Contract' },
  { id: 'polishing-cutting', categoryId: 'polishing', name: 'Cutting' },
  { id: 'polishing-gola', categoryId: 'polishing', name: 'Gola' },

  { id: 'paint-contract', categoryId: 'paintwork', name: 'Contract' },
  { id: 'paint-labour', categoryId: 'paintwork', name: 'Labour' }
];

export const ITEM_SEED: Item[] = [
  { id: 'itm-architectural-drawings', subCategoryId: 'design-drawings', name: 'Architectural Drawings' },
  { id: 'itm-structural-drawings', subCategoryId: 'design-drawings', name: 'Structural Drawings' },
  { id: 'itm-services-drawings', subCategoryId: 'design-drawings', name: 'Services Drawings' },
  { id: 'itm-permit-docs', subCategoryId: 'design-docs', name: 'Permit Documentation' },
  { id: 'itm-submission-fee', subCategoryId: 'design-fees', name: 'Submission Fee' },

  { id: 'itm-boring-advance', subCategoryId: 'boring-contract', name: 'Boring Advance' },
  { id: 'itm-boring-installment', subCategoryId: 'boring-contract', name: 'Boring Installment' },
  { id: 'itm-boring-final', subCategoryId: 'boring-contract', name: 'Boring Final Payment' },
  { id: 'itm-boring-labour', subCategoryId: 'boring-labour', name: 'Boring Labour' },

  { id: 'itm-manual-excavation', subCategoryId: 'earth-manual-excavation', name: 'Manual Excavation', defaultUnit: 'cft' },
  { id: 'itm-foundation-excavation', subCategoryId: 'earth-moving', name: 'Foundation Excavation', defaultUnit: 'cft' },
  { id: 'itm-levelling', subCategoryId: 'earth-loader-levelling', name: 'Levelling', defaultUnit: 'sqft' },
  { id: 'itm-debris-removal', subCategoryId: 'earth-moving', name: 'Debris Removal', defaultUnit: 'trip' },
  { id: 'itm-water-tanker-earth', subCategoryId: 'earth-water-tanker', name: 'Water Tanker', defaultUnit: 'trip' },

  { id: 'itm-site-clearing', subCategoryId: 'site-clearing', name: 'Site Clearing' },
  { id: 'itm-site-demolition', subCategoryId: 'site-demolition', name: 'Demolition Labour' },
  { id: 'itm-guard-salary', subCategoryId: 'site-guard-salary', name: 'Guard Salary', defaultUnit: 'month' },
  { id: 'itm-store-material', subCategoryId: 'site-store', name: 'Store Material' },

  { id: 'itm-structure-contract-payment', subCategoryId: 'structure-contract', name: 'Contract Payment - Structure' },
  { id: 'itm-brick-pr1', subCategoryId: 'structure-brickwork', name: 'Brick PR1', defaultUnit: 'pcs' },
  { id: 'itm-cement', subCategoryId: 'structure-brickwork', name: 'Cement', defaultUnit: 'bag' },
  { id: 'itm-sand', subCategoryId: 'structure-brickwork', name: 'Sand', defaultUnit: 'cft' },
  { id: 'itm-crush', subCategoryId: 'structure-brickwork', name: 'Crush', defaultUnit: 'cft' },
  { id: 'itm-shuttering-labour', subCategoryId: 'structure-shuttering', name: 'Shuttering Labour' },
  { id: 'itm-binding-wire', subCategoryId: 'structure-loading', name: 'Binding Wire', defaultUnit: 'kg' },
  { id: 'itm-steel-loading', subCategoryId: 'structure-loading', name: 'Steel Loading' },
  { id: 'itm-steel-carriage', subCategoryId: 'structure-carriage', name: 'Steel Carriage' },
  { id: 'itm-manual-labour-structure', subCategoryId: 'structure-labour', name: 'Manual Labour' },

  { id: 'itm-wiring-labour', subCategoryId: 'electric-wiring', name: 'Wiring Labour' },
  { id: 'itm-electric-cable', subCategoryId: 'electric-fittings', name: 'Electric Cable', defaultUnit: 'roll' },
  { id: 'itm-electric-pipe', subCategoryId: 'electric-fittings', name: 'Electric Pipe', defaultUnit: 'length' },
  { id: 'itm-switch-socket', subCategoryId: 'electric-fittings', name: 'Switch / Socket' },
  { id: 'itm-meter-fee', subCategoryId: 'electric-electricity', name: 'Meter Fee' },

  { id: 'itm-steel-3-8', subCategoryId: 'steelworks-contract', name: 'Steel 3/8', defaultUnit: 'kg' },
  { id: 'itm-steel-1-2', subCategoryId: 'steelworks-contract', name: 'Steel 1/2', defaultUnit: 'kg' },
  { id: 'itm-steelworks-labour', subCategoryId: 'steelworks-labour', name: 'Steelworks Labour' },
  { id: 'itm-grating-work', subCategoryId: 'steelworks-grating', name: 'Grating Work' },

  { id: 'itm-gi-fittings', subCategoryId: 'plumbing-gi-fittings', name: 'GI Fittings' },
  { id: 'itm-ppr-fittings', subCategoryId: 'plumbing-fittings', name: 'PPR Fittings' },
  { id: 'itm-upvc-fittings', subCategoryId: 'plumbing-fittings', name: 'uPVC Fittings' },
  { id: 'itm-plumbing-labour', subCategoryId: 'plumbing-fittings', name: 'Plumbing Labour' },
  { id: 'itm-water-tanker-plumbing', subCategoryId: 'plumbing-water-tanker', name: 'Water Tanker' },

  { id: 'itm-termite-spray', subCategoryId: 'chemical-termite', name: 'Termite Spray' },

  { id: 'itm-plaster-contract', subCategoryId: 'plaster-contract', name: 'Plaster Contract Payment' },
  { id: 'itm-plaster-labour', subCategoryId: 'plaster-labour', name: 'Plaster Labour' },

  { id: 'itm-tile-cutting', subCategoryId: 'tile-cutting', name: 'Tile Cutting' },
  { id: 'itm-tile-bond', subCategoryId: 'tile-chips', name: 'Tile Bond' },
  { id: 'itm-tiles', subCategoryId: 'tile-chips', name: 'Tiles', defaultUnit: 'box' },
  { id: 'itm-marble', subCategoryId: 'tile-chips', name: 'Marble' },
  { id: 'itm-granite', subCategoryId: 'tile-chips', name: 'Granite' },
  { id: 'itm-carriage-tiles', subCategoryId: 'tile-carriage', name: 'Carriage' },

  { id: 'itm-wood-sheet', subCategoryId: 'wood-sheet', name: 'Wood Sheet' },
  { id: 'itm-wood-cutting-labour', subCategoryId: 'wood-cutting', name: 'Wood Cutting Labour' },
  { id: 'itm-woodwork-contract', subCategoryId: 'wood-contract', name: 'Woodwork Contract Payment' },

  { id: 'itm-false-ceiling-contract', subCategoryId: 'false-contract', name: 'False Ceiling Contract Payment' },
  { id: 'itm-false-ceiling-sheet-cutting', subCategoryId: 'false-sheet-cutting', name: 'Sheet Cutting Labour' },

  { id: 'itm-aluminum-work', subCategoryId: 'aluminum-work', name: 'Aluminum Work' },
  { id: 'itm-glass-work', subCategoryId: 'aluminum-work', name: 'Glass Work' },

  { id: 'itm-appliance-purchase', subCategoryId: 'furnishing-appliances', name: 'Appliance Purchase' },

  { id: 'itm-polish-contract', subCategoryId: 'polishing-contract', name: 'Polish Contract Payment' },
  { id: 'itm-polish-labour', subCategoryId: 'polishing-cutting', name: 'Polish Labour' },
  { id: 'itm-gola-work', subCategoryId: 'polishing-gola', name: 'Gola Work' },

  { id: 'itm-paint-material', subCategoryId: 'paint-contract', name: 'Paint Material' },
  { id: 'itm-paint-labour', subCategoryId: 'paint-labour', name: 'Paint Labour' },

  { id: 'itm-loading-unloading', subCategoryId: 'structure-loading', name: 'Loading / Unloading' }
].map((item) => ({ ...item, isActive: true }));

export const STAGE_SEED: Stage[] = [
  { id: 'excavation', name: 'Excavation', sortOrder: 1 },
  { id: 'foundation', name: 'Foundation', sortOrder: 2 },
  { id: 'plinth', name: 'Plinth', sortOrder: 3 },
  { id: 'ground-floor', name: 'Ground Floor', sortOrder: 4 },
  { id: 'first-floor', name: 'First Floor', sortOrder: 5 },
  { id: 'roof-slab', name: 'Roof Slab', sortOrder: 6 },
  { id: 'mumty', name: 'Mumty', sortOrder: 7 },
  { id: 'store-room', name: 'Store Room', sortOrder: 8 },
  { id: 'electrical', name: 'Electrical', sortOrder: 9 },
  { id: 'plumbing', name: 'Plumbing', sortOrder: 10 },
  { id: 'finishing', name: 'Finishing', sortOrder: 11 },
  { id: 'paint', name: 'Paint', sortOrder: 12 }
];

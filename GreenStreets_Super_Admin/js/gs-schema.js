/* ==========================================================================
   gs-schema.js — Greenstreets canonical Packaging Component schema + the
   ACTIVE RETAILER configuration.

   Greenstreets is a multi-retailer platform. This file is the single source of
   truth shared by all three component experiences (manual Component Wizard, AI
   Upload Review, and the saved Packaging Component detail/edit page):

     • GS_RETAILER          — the active retailer configuration (the ONLY place a
                              retailer name lives). Swap this object to run the
                              portal for a different retailer.
     • GS_VOCAB             — the retailer-configured controlled dropdown
                              vocabularies. For this demo they are the values in
                              the supplied spreadsheet "Updated Data Template 26"
                              columns J–AU / the DropDowns_ sheet.
     • GS_SOURCE_TYPES      — neutral internal source-type values; labels are
                              rendered dynamically from GS_RETAILER.
     • GS_COMPONENT_SCHEMA  — the canonical section/field model (retailer-neutral
                              keys; controlled vocab pulled from GS_VOCAB).
     • GS_EXPORT_COLUMNS    — spreadsheet export mapping (columns J–AU) for the
                              current retailer.

   Nothing retailer-specific ("Primark", "Primark Stores Ltd", "…-nominated") is
   hard-coded in the shared UI — it all resolves through GS_RETAILER so a future
   retailer can supply its own vocab, required fields, compliance rules, document
   requirements and export mapping without touching the component structure.
   ========================================================================== */
(function (root) {
  'use strict';

  /* ── ACTIVE RETAILER CONFIGURATION ─────────────────────────────────────────
     The prototype's active demo retailer. Everything retailer-specific comes
     from here. To run the portal for another retailer, replace this object. */
  var GS_RETAILER = {
    retailerName: 'Primark',
    /* Reusable copy that used to be hard-coded around the portal. */
    legalName: 'Primark Stores Ltd',
    /* Source-type display labels (neutral internal values map to these). */
    sourceTypeLabels: {
      local: 'Local',
      retailerPreferred: 'Primark Preferred',
      retailerNominated: 'Primark Nominated'
    },
    /* Specific "{Retailer} Nominated (…)" variants from the current spreadsheet
       dropdown. A different retailer supplies its own list (or none). */
    nominatedVariants: [
      'Plastic Hangers - Apparel',
      'Plastic Hangers - Footwear',
      'Cardboard Hangers - Babywear',
      'Cardboard Hangers - Lingerie',
      'Cardboard Hanger - Swimwear',
      'Cardboard Hangers - Footwear',
      'Cardboard Boxes - Lingerie Briefs',
      'Polybags - Kids Briefs',
      'Polybags - Baby Bodysuit'
    ]
  };

  /* Reusable active-retailer copy (dynamic — never hard-code the retailer). */
  function retailerText(key) {
    var r = GS_RETAILER;
    switch (key) {
      case 'name': return r.retailerName;
      case 'legalName': return r.legalName || r.retailerName;
      case 'buysFromYou': return r.retailerName + ' buys from you';
      case 'workingWith': return r.retailerName;
      default: return r.retailerName;
    }
  }

  /* ── NEUTRAL SOURCE TYPES → dynamic retailer labels ────────────────────────
     Stored internally as neutral values (local / retailer_preferred /
     retailer_nominated[:variant]); displayed with the active retailer's name. */
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

  function sourceTypeOptions() {
    var L = GS_RETAILER.sourceTypeLabels;
    var out = [
      { value: 'local', label: L.local || 'Local' },
      { value: 'retailer_preferred', label: L.retailerPreferred || (GS_RETAILER.retailerName + ' Preferred') },
      { value: 'retailer_nominated', label: L.retailerNominated || (GS_RETAILER.retailerName + ' Nominated') }
    ];
    (GS_RETAILER.nominatedVariants || []).forEach(function (v) {
      out.push({
        value: 'retailer_nominated:' + slug(v),
        label: (L.retailerNominated || (GS_RETAILER.retailerName + ' Nominated')) + ' (' + v + ')'
      });
    });
    return out;
  }
  function sourceTypeLabel(value) {
    var found = sourceTypeOptions().filter(function (o) { return o.value === value; })[0];
    return found ? found.label : (value || '');
  }
  /* Map a raw display string (e.g. from legacy data / spreadsheet) to a neutral value. */
  function sourceTypeValue(display) {
    if (!display) return 'local';
    var opts = sourceTypeOptions();
    var hit = opts.filter(function (o) { return o.label.toLowerCase() === String(display).toLowerCase(); })[0];
    if (hit) return hit.value;
    var d = String(display).toLowerCase();
    if (d.indexOf('nominated') > -1) return 'retailer_nominated';
    if (d.indexOf('preferred') > -1) return 'retailer_preferred';
    return 'local';
  }

  /* ── CONTROLLED VOCABULARIES (retailer-configured; current = spreadsheet) ── */
  var GS_VOCAB = {
    packagingLevel: ['Primary', 'Secondary', 'Tertiary'],
    packagingType: ["Attacher/Tie (Barb)", "Attacher/Tie (Cable tie)", "Attacher/Tie (Elastic thread)", "Attacher/Tie (Paper twisted)", "Attacher/Tie (Shuttlelock)", "Attacher/Tie (Thread)", "Attacher/Tie (Twine)", "Bag (Poly + Adhesive)", "Bag (Poly Zip lock)", "Bag (Poly)", "Bag + Hook (Poly)", "Band", "Blister pack", "Bottle (Beverage)", "Bottle (Non-Beverage)", "Box/Carton", "Box/Carton + Hook", "Box/Carton with plastic window", "Bucket", "Cable ties", "Can (Aerosol)", "Can/Box (Tin Plated Steel)", "Cap", "Cap + Brush", "Card (Display eg. jewellry)", "Card (Over-rider)", "Cascade + Hook (Waterfall)", "Cascade (Waterfall)", "Clip", "Collar", "Cup", "Display Unit CDU (Counter top)", "Display Unit FSDU (Floor Standing)", "Display Unit SRP (Shelf Ready Packaging)", "Dropper", "Edge Protector", "Envelope", "Envelope + Hook", "Filling (Dunnage)", "Void Filler / Cushioning", "Film", "Film (Lidding)", "Foil", "Godet", "Handle", "Hanger (Cardboard Hanger)", "Hanger (Clip Hanger)", "Hanger (Plastic Hanger)", "Hanger (Plastic Hanger with Metal Hook)", "Hook", "Insert (Backing)", "Insert (Butterfly top button)", "Insert (Collar)", "Insert (Cuff)", "Insert (Divider)", "Insert (Header)", "Jar", "Label (Booklet)", "Leaflet (Instruction)", "Lid", "Lipstick", "Net/Netting", "Pallet (reusable e.g. CHEP)", "Pallet Corner (edge post)", "Pallet Cover", "Pallet Label", "Pallet Layer Pad", "Pallette + Hinge top (Make-up)", "Paper Sheet", "Pencil", "Pencil (twist lip/eye)", "Plug", "Pot", "Pouch", "Pump", "Ribbon", "Sachet", "Seal", "Self Adhesive Label (Peel & Read)", "Self Adhesive Label (Single)", "Shipper", "Shrink Wrap", "Skewer", "Sleeve", "Spring", "Strapping", "Stretch Wrap", "Swing Tag", "Tape", "Tray", "Trigger", "Tub", "Tube", "Vac Pac Bag", "Wrap band"],
    baseMaterial: ["Cardboard_CartonBoard", "Cardboard_CartonBoard_Laminated", "Cardboard_CartonBoard_VarnishedUV", "Cardboard_CartonBoard_VarnishedWaterBased", "Composite", "Composite_Paper_Metal", "Composite_Paper_Plastic", "Corrugate", "Corrugate_Microflute", "Glass", "Metal", "Other", "Paper", "Paper_Laminated", "Paper_VarnishedUV", "Paper_VarnishedWaterBased", "Plastic_Multilayer_Composite", "Plastic_Single_MonoLayer", "Wood"],
    materialName: ["Cotton", "Elastic", "Foam", "Glass", "Jute", "Metal Aluminium", "Metal Steel", "Metal Tin", "Other", "Paper  SBB - Solid Bleached Board", "Paper AZ - Cast Coated SBB (Solid Bleached Board)", "Paper FBB - Folding Box Board", "Paper GC1 - Coated FBB, white back (Folding Box Board)", "Paper GC2 - Coated FBB, cream back (Folding Box Board)", "Paper GD1 - Coated WLC, grey back (While Lined Chip)", "Paper GD2 - Coated WLC, grey back (White Lined Chip)", "Paper GD3 - Coated WLC, grey back (White Lined Chip)", "Paper GN - Coated SUB, white or brown back (Solid Unbleached Board)", "Paper GT - Coated WLC, cream or white back (White Lined Chip)", "Paper GZ - Coated SBB (Solid Bleached Board)", "Paper Kraft", "Paper SUB - Solid Unbleached Board", "Paper UC1 - Uncoated FBB, white back (Folding Box Board)", "Paper UC2 - Uncoated FBB, cream back (Folding Box Board)", "Paper UD - Uncoated WLC, grey back", "Paper UT - Uncoated WLC, cream or white back", "Paper UZ - Uncoated SBB (Solid Bleached Board)", "Paper WLC - White Lined Chipboard", "Plastic ABS (Acrylonitrile Butadiene Styrene)", "Plastic EVOH (Ethylene Vinyl Alcohol)", "Plastic HDPE (High Density Polyethylene)", "Plastic LDPE (Low Density Polyethylene)", "Plastic PA (Polyacrylate) Nylon", "Plastic PC (Polycarbonate)", "Plastic PET/PETE (Polyethylene Terephthalate)", "Plastic PETG (Polyethylene Terephthalate Glycol)", "Plastic PMMA (Polymethyl Methacrylate)", "Plastic PP (Polypropylene)", "Plastic PS (Polystyrene) eg. Styrofoam", "Plastic PU (Polyurethane)", "Plastic PVC (Polyvinyl Chloride) eg. Vinyl", "Plastic PVDC (Polyvinylidene Chloride)", "Plastic PVOH (Polyvinyl Alcohol)", "Plastic SAN (Styrene Acrylonitrile)", "Textiles", "Twine", "Wood"],
    yesNo: ['Yes', 'No'],
    recycledEvidence: ['Product specification', 'Contracts', 'Production certificates and certificates of conformity', 'Business accounting systems', 'Accreditations and international standards', 'Quality assurance audits', 'Sales and purchase invoices', 'Environmental Agency etc. accreditation and equivalent approvals from other bodies', 'Other (Please state)'],
    colour: ['Clear', 'Natural', 'Black', 'Blue', 'White', 'Brown', 'Green', 'Red', 'Orange', 'Yellow', 'Multi', 'Other'],
    opacity: ['Colourless', 'Coloured - translucent', 'Coloured - opaque and sortable', 'Coloured - dark and non-sortable'],
    decoration: ['None', 'Other', 'Printed - Flexo', 'Printed - Offset Litho', 'Printed - Gravure', 'Hot foil', 'Cold foil', 'Metalised', 'Fluorescent'],
    certification: ['None', 'N/A', 'PEFC', 'FSC', 'FSC Mixed', 'FSC Recycled', 'RCS', 'GRS', 'OEKOTEX', 'Other'],
    materialCompliance: ['No', 'TPCH/PROP65 only', 'REACH/EU directive 94/62/EC only', 'TPCH/PROP65/REACH/EU directive 94/62/EC'],
    chlorine: ['None', 'EC (Elemental Chlorine)', 'ECF (Elemental Chlorine Free)', 'PCF (Processed Chlorine Free)', 'TCF Total Chlorine Free'],
    /* Product-level (kept separate from the component library). */
    packingMethod: ['Flat', 'Flat / Hanging', 'GOH (Placed on hanger on a rail)', 'Placed on Hanger in Box', 'Folded & Boxed', 'Boxed', 'Shrink Wrapped', 'Hanging']
  };

  /* ── CANONICAL COMPONENT SCHEMA ────────────────────────────────────────────
     Section order is fixed and shared by all three experiences. Field controls:
       select   — controlled dropdown (options from GS_VOCAB)
       source   — neutral source-type dropdown (dynamic retailer labels)
       yesno    — Boolean Yes/No control
       number   — numeric input (optional unit)
       text     — free text
       textarea — multi-line free text
       materials— dynamic, unlimited material-composition rows
       docs     — unlimited Supporting Documents collection
     `req` marks mandatory; `reqIf` marks conditionally mandatory. */
  var GS_COMPONENT_SCHEMA = [
    { key: 'level_format', num: 1, title: 'Packaging Level & Format', fields: [
      { key: 'packagingLevel', label: 'Packaging Level', control: 'select', vocab: 'packagingLevel', req: true },
      { key: 'packagingType', label: 'Packaging Type (name)', control: 'select', vocab: 'packagingType', req: true },
      { key: 'otherTypeDesc', label: 'Other Packaging Type Description', control: 'text' }
    ] },
    { key: 'source_type', num: 2, title: 'Packaging Source Type', fields: [
      { key: 'sourceType', label: 'Packaging Source Type', control: 'source', req: true }
    ] },
    { key: 'material_info', num: 3, title: 'Material Information', fields: [
      { key: 'baseMaterial', label: 'Base Material', control: 'select', vocab: 'baseMaterial', req: true },
      { key: 'materials', label: 'Materials', control: 'materials', req: true }
    ] },
    { key: 'recycled', num: 4, title: 'Post-Consumer & Post-Industrial Recycled Content', fields: [
      { key: 'recycledContent', label: 'Recycled Content', control: 'yesno', req: true },
      { key: 'pcr', label: 'Post-Consumer Recycled Content (%)', control: 'number', unit: '%', reqIf: { field: 'recycledContent', value: 'Yes' } },
      { key: 'pir', label: 'Post-Industrial Recycled Content (%)', control: 'number', unit: '%', reqIf: { field: 'recycledContent', value: 'Yes' } },
      { key: 'recycledEvidence', label: 'Supporting evidence of recycled content', control: 'select', vocab: 'recycledEvidence' },
      { key: 'recycledComments', label: 'Recycled Content Comments', control: 'textarea' }
    ] },
    { key: 'colour_decoration', num: 5, title: 'Colour & Decoration', fields: [
      { key: 'colour', label: 'Material Colour', control: 'select', vocab: 'colour', req: true },
      { key: 'opacity', label: 'Opacity', control: 'select', vocab: 'opacity', req: true },
      { key: 'decoration', label: 'Decoration', control: 'select', vocab: 'decoration', req: true }
    ] },
    { key: 'weight_grammage', num: 6, title: 'Weight & Grammage', fields: [
      { key: 'weight', label: 'Weight (g)', control: 'number', unit: 'g', req: true },
      { key: 'grammage', label: 'Grammage (gsm)', control: 'number', unit: 'gsm' },
      { key: 'gauge', label: 'Gauge in Micron (um)', control: 'number', unit: 'um' }
    ] },
    { key: 'dimensions', num: 7, title: 'Material Dimensions', fields: [
      { key: 'length', label: 'Length (mm) (or diameter if applicable)', control: 'number', unit: 'mm' },
      { key: 'width', label: 'Width (mm)', control: 'number', unit: 'mm' },
      { key: 'height', label: 'Height or Depth (mm)', control: 'number', unit: 'mm' }
    ] },
    { key: 'additional', num: 8, title: 'Additional Packaging Information', fields: [
      { key: 'certification', label: 'Certification', control: 'select', vocab: 'certification', req: true },
      { key: 'otherCertDetails', label: 'Other Certification Details', control: 'text' },
      { key: 'supplierName', label: 'Packaging Supplier Name', control: 'text', req: true },
      { key: 'supplierAddress', label: 'Packaging Supplier Address', control: 'text', req: true },
      { key: 'documents', label: 'Supporting Documents', control: 'docs' }
    ] },
    { key: 'compliance', num: 9, title: 'Material Compliance', fields: [
      { key: 'materialCompliance', label: 'Material Compliance', control: 'select', vocab: 'materialCompliance', req: true },
      { key: 'mineralOils', label: 'Does the material and/or inks contain mineral oils above allowable limits?', control: 'yesno', req: true },
      { key: 'bpa', label: 'Does the material contain BPA above allowable limits?', control: 'yesno', req: true },
      { key: 'pfas', label: 'Does the material contain PFAs?', control: 'yesno', req: true },
      { key: 'chlorine', label: 'Is chlorine used in the manufacture of the material/component?', control: 'select', vocab: 'chlorine', req: true }
    ] }
  ];

  /* ── SPREADSHEET EXPORT MAPPING (columns J–AU) for the active retailer ──────
     Materials 1–4 map to P–W. Beyond four materials the portal keeps every row
     in the data model and surfaces an export warning (see gsMaterialExportNote). */
  var GS_EXPORT_COLUMNS = {
    packagingLevel: 'J', packagingType: 'K', otherTypeDesc: 'L',
    sourceType: 'M', baseMaterial: 'N', materialCount: 'O',
    material1Name: 'P', material1Pct: 'Q', material2Name: 'R', material2Pct: 'S',
    material3Name: 'T', material3Pct: 'U', material4Name: 'V', material4Pct: 'W',
    materialTotal: 'X',
    recycledContent: 'Y', pcr: 'Z', pir: 'AA', recycledEvidence: 'AB', recycledComments: 'AC',
    colour: 'AD', opacity: 'AE', decoration: 'AF',
    weight: 'AG', grammage: 'AH', gauge: 'AI',
    length: 'AJ', width: 'AK', height: 'AL',
    certification: 'AM', otherCertDetails: 'AN', supplierName: 'AO', supplierAddress: 'AP',
    materialCompliance: 'AQ', mineralOils: 'AR', bpa: 'AS', pfas: 'AT', chlorine: 'AU',
    /* Supporting documents export into the recycled supporting-evidence field as a
       semicolon-separated list of names/references (retailer export mapping). */
    documents: 'AB'
  };
  var MATERIAL_EXPORT_LIMIT = 4;
  function materialExportNote(materials) {
    var n = (materials || []).filter(function (m) { return m && (m.name || '').trim(); }).length;
    if (n > MATERIAL_EXPORT_LIMIT) {
      return 'This component has ' + n + ' materials. The current ' + GS_RETAILER.retailerName +
        ' spreadsheet export has columns for the first ' + MATERIAL_EXPORT_LIMIT +
        ' only — the remaining ' + (n - MATERIAL_EXPORT_LIMIT) +
        ' are kept in the record and included in an extended export representation.';
    }
    return '';
  }

  /* Helper: resolve a field's option list (vocab name → array). */
  function fieldOptions(field) {
    if (field.control === 'source') return sourceTypeOptions().map(function (o) { return o.label; });
    if (field.control === 'yesno') return GS_VOCAB.yesNo.slice();
    if (field.vocab && GS_VOCAB[field.vocab]) return GS_VOCAB[field.vocab].slice();
    return [];
  }

  /* Public API */
  var api = {
    GS_RETAILER: GS_RETAILER,
    GS_VOCAB: GS_VOCAB,
    GS_COMPONENT_SCHEMA: GS_COMPONENT_SCHEMA,
    GS_EXPORT_COLUMNS: GS_EXPORT_COLUMNS,
    MATERIAL_EXPORT_LIMIT: MATERIAL_EXPORT_LIMIT,
    retailerText: retailerText,
    sourceTypeOptions: sourceTypeOptions,
    sourceTypeLabel: sourceTypeLabel,
    sourceTypeValue: sourceTypeValue,
    fieldOptions: fieldOptions,
    materialExportNote: materialExportNote
  };
  root.GSSchema = api;
  /* Also expose the most-used bits as globals for the non-module prototype code. */
  root.GS_RETAILER = GS_RETAILER;
  root.GS_VOCAB = GS_VOCAB;
  root.GS_COMPONENT_SCHEMA = GS_COMPONENT_SCHEMA;
  root.gsSourceTypeOptions = sourceTypeOptions;
  root.gsSourceTypeLabel = sourceTypeLabel;
  root.gsSourceTypeValue = sourceTypeValue;
  root.gsRetailerText = retailerText;
})(typeof window !== 'undefined' ? window : this);

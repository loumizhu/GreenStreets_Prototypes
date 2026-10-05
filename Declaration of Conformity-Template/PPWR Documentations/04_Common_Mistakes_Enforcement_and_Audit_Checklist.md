# Common Mistakes, Enforcement & Pre-Signing Audit Checklist
**Risk Mitigation Guide & Market Surveillance Inspection Protocol**

---

## 1. Top 10 High-Risk Mistakes in PPWR DoC Authoring

| # | Pitfall / Error | Why It Invalidates the DoC | Proper Corrective Action |
| :--- | :--- | :--- | :--- |
| **1** | **Using the Product SKU instead of Packaging ID** | A product code (e.g. `SHAMP-250`) identifies the formula, not the bottle, cap, and label. If packaging changes while product SKU stays constant, the DoC fails traceability. | Assign a dedicated Packaging Specification ID or Component BOM Code (e.g. `PKG-BTL-HDPE-250-01`). |
| **2** | **"Paper-Only" DoC (No Technical Dossier)** | Signing a DoC without having an assembled Annex VII technical dossier on file is an immediate compliance violation. | Never sign a DoC until all lab reports, DfR assessments, and BOM specifications are archived in the technical file. |
| **3** | **Citing Repealed Directive 94/62/EC** | Directives are superseded. Referencing 94/62/EC instead of **Regulation (EU) 2025/40** indicates an obsolete document. | Cite `Regulation (EU) 2025/40 (PPWR)` as primary Union harmonisation legislation. |
| **4** | **Adding "Softening" Disclaimers** | Adding phrases such as *"to the best of our knowledge"* or *"based on supplier claims without verification"* to Annex VIII Item 3. | Keep the statutory sole responsibility statement verbatim: *"This declaration of conformity is issued under the sole responsibility of the manufacturer."* |
| **5** | **Over-Grouping Dissimilar Packaging** | Issuing one single DoC for an entire brand's diverse portfolio (e.g., grouping glass jars, plastic tubes, and cardboard boxes together). | Issue distinct DoCs per packaging system format. Grouping is only permitted for identical structural specifications with minor dimensional variations. |
| **6** | **Ignoring Secondary & Transport Packaging** | Believing PPWR only applies to the primary retail pack. In reality, tertiary pallets, stretch wrap, tape, and edge guards are packaging. | Prepare compliant technical files and DoCs for shipping configurations and transit materials. |
| **7** | **Accepting Blanket Supplier Letters** | Relying on an unverified one-page letter from a converter stating *"Our materials are eco-friendly and fully compliant with EU law"*. | Demand quantitative test reports: ICP-MS heavy metal screen (<100 ppm) and DIN EN ISO 21675 PFAS non-detection certificates. |
| **8** | **Language Non-Compliance (Article 39(2))** | Providing only an English DoC to market surveillance authorities in France, Germany, Spain, or Italy. | Ensure the DoC is available in the official language(s) mandated by each Member State where goods are sold. |
| **9** | **Exceeding the 50% Empty Space Limit** | Shipping e-commerce or grouped packages with large air voids or excessive paper stuffing violating Article 24. | Perform CAD volumetric ratio audits; engineer box sizes to match product volume; maintain void space <50%. |
| **10** | **Post-Dating or Retroactive Signing** | Signing a DoC weeks after customs clearance or product distribution has commenced in the EU. | The DoC must be fully signed and dated **prior to placing the specific batch on the European market**. |

---

## 2. Market Surveillance Inspection Protocol

Enforcement under the PPWR is governed by **Chapter IX (Articles 58–62)** and **Article 68 (Penalties)** in conjunction with **Regulation (EU) 2019/1020** (Market Surveillance and Compliance of Products).

### 2.1 Formal Non-Compliance Triggers (Article 62(1))
National market surveillance authorities are mandated under Article 62 to require economic operators to rectify non-compliance where:
1. **Art. 62(1)(a):** The EU Declaration of Conformity has not been drawn up.
2. **Art. 62(1)(b):** The EU Declaration of Conformity has not been drawn up correctly (e.g. missing Annex VIII items, incorrect legal statements).
3. **Art. 62(1)(c):** The QR code or digital data carrier (Art. 12) does not provide access to the required sorting and material data.
4. **Art. 62(1)(d):** The technical documentation (Annex VII) is not available, is incomplete, or contains errors.
5. **Art. 62(1)(e):** Manufacturer/importer traceability markings (Arts. 15(6), 18(3)) are absent, false, or incomplete.
6. **Art. 62(1)(g):** Excessive packaging (empty space ratio $>50\%$ under Art. 24) or banned single-use plastic formats (Annex V / Art. 25) are placed on the market.

> [!WARNING]
> **Sanctions under Article 62(2) & Article 68:** If formal non-compliance persists, Member States are legally required to restrict or prohibit the packaging from being made available on the market, order its immediate market recall or withdrawal, and impose effective, proportionate, and dissuasive penalties.

### 2.2 The Inspection Sequence
```
[1. Random Warehouse / Customs Check] 
               │
               ▼
[2. Formal Document Request (DoC)] 
    Authority demands Annex VIII DoC.
               │
               ▼
[3. The 10-Day Clock (Technical Dossier Demand - Art. 15(10))] 
    Authority requests Annex VII technical file to substantiate DoC claims.
    Statutory deadline: 10 working days.
               │
               ▼
[4. Lab Verification Testing] 
    Authority draws physical samples for accredited laboratory testing:
    - Heavy metals (ICP-OES / EN 13428: Pb+Cd+Hg+Cr(VI) < 100 mg/kg)
    - PFAS screen (LC-MS/MS / DIN EN ISO 21675)
    - Recyclability / NIR sortability check
               │
               ▼
[5. Outcome & Sanctions] 
    Compliant ──> Inspection closed.
    Non-Compliant ──> Article 62 formal notice, market withdrawal, 
                     border customs seizure, administrative fines under Art. 68.
```

---

## 3. Pre-Signing Executive Audit Checklist (16 Points)

Before authorized executive signature is affixed to any Annex VIII DoC, verify all 16 points:

- [ ] **1. Packaging Identifier Unique:** Is the ID tied specifically to the packaging specification, distinct from the product SKU?
- [ ] **2. Legal Entity Verified:** Are the company name and physical EU registered address accurate and legally current?
- [ ] **3. Authorised Representative Specified:** If non-EU manufacturer, is an established EU AR named with a written Article 17 mandate?
- [ ] **4. Sole Responsibility Statement Exact:** Is Item 3 verbatim with zero qualifying disclaimers?
- [ ] **5. Component BOM Complete:** Are all components (bottle, cap, label, adhesive, liner) identified with material codes (97/129/EC / Art. 12)?
- [ ] **6. Tare Weights Measured:** Are nominal component weights documented in grams?
- [ ] **7. Heavy Metals Below 100 ppm:** Do valid test reports confirm $Pb + Cd + Hg + Cr(VI) < 100 \text{ mg/kg}$ (Art. 5(4))?
- [ ] **8. PFAS Compliance Verified:** If food-contact, do test reports confirm targeted PFAS < 25/250 ppb and total fluorine screening under 50 mg/kg (Art. 5(5))?
- [ ] **9. Recyclability Assessment Documented:** Is a DfR evaluation score on file conforming to Annex II Table 3 (Grade A, B, or C $\ge 70\%$)?
- [ ] **10. Recycled Content Audited:** If claiming PCR plastic, is an EN 15343 third-party audit certificate attached (Art. 7)?
- [ ] **11. Compostability Certified (if applicable):** If compostable format (tea/coffee pod, fruit sticker), is EN 13432/EN 14995 certification on file (Art. 9 & Annex III)?
- [ ] **12. Minimisation Justified:** Is a design calculation on file demonstrating minimal weight/volume per Annex IV performance criteria (Art. 10)?
- [ ] **13. Empty Space Compliant:** If e-commerce/transport/grouped, is the empty space ratio verified at $\le 50\%$ with void fillers counted as empty space (Art. 24)?
- [ ] **14. Notified Body Status Stated:** Is Module A internal production control explicitly referenced?
- [ ] **15. Signatory Authority Validated:** Does the person signing possess corporate legal delegation to bind the company?
- [ ] **16. Target Market Languages Available:** Is a translated version prepared for each destination EU Member State (Art. 39(2))?

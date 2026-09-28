/* ══════════════════════════════════════════════════════════════════════════
   gs-upsell.js — EXPLORATION ONLY. "Library Pro" upsell touchpoints.

   One file, loaded last on every page of this folder. It never edits the
   pages' own markup by hand — each touchpoint is injected next to an anchor
   the page already has, so the exploration can be thrown away by deleting the
   two <link>/<script> lines.

   What is sold: PORTABILITY. The whole packaging library as one tidy,
   schema-aligned pack (sheet + DoCs + spec sheets) you can hand to any
   retailer or partner supplier. What is never gated: anything the retailer
   asked for — submitting data and downloading a DoC stay free.

   Rules the layer enforces (see RULES below):
     · proactive prompts only AFTER a success, never mid-task
       (the AI review steps get nothing at all);
     · at most ONE proactive prompt per session;
     · a dismissal snoozes that prompt for 14 days; two dismissals retire it,
       leaving only the passive Pro chips + sidebar meter;
     · show the value (a preview of their own file) before the price;
     · one free taste: export a single component once.

   Touchpoints, by page:
     sidebar (all)   passive library meter → export preview
     Confirmation    inline card under the success message (proactive)
     Packaging       "Export library" button + readiness banner (proactive)
                     + toast after a wizard save (proactive)
     Packaging-*     "Share spec" next to Download DoC (free single / Pro all)
     AI-Upload       hint under "Download blank template"
     Documents       hint under the drop zone ("bundle with your pack")
     Welcome         optional 4th step, visibly outside the required three
     Settings        "Plan & billing" card
   ══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  /* ── Demo library (mirrors the Packaging listing) ─────────────────────── */
  var LIB = [
    ['Swing Tag','Primary','Paper GC1 - Coated FBB','2.4 g','80% PCR','Complete'],
    ['Hanger','Primary','Plastic LDPE','14 g','30% PCR','Review needed'],
    ['Poly Bag','Primary','Plastic LDPE','8.1 g','0% PCR','Review needed'],
    ['Display Box','Primary','Cardboard/CartonBoard','45 g','65% PCR','Complete'],
    ['Wrap Band','Primary','Paper Kraft','1.2 g','100% PCR','Complete'],
    ['Tissue Paper','Primary','Paper SUB','3.5 g','50% PCR','Complete'],
    ['Shipping Carton','Secondary','Corrugate','180 g','65% PCR','Complete'],
    ['Shelf-Ready Tray','Secondary','Corrugate Microflute','95 g','70% PCR','Complete'],
    ['Carton Divider','Secondary','Cardboard/CartonBoard','22 g','55% PCR','Complete'],
    ['Padding','Secondary','Plastic LDPE','12 g','20% PCR','Review needed'],
    ['GOH Polybag','Secondary','Plastic LDPE','16 g','25% PCR','Review needed'],
    ['CDU Display Unit','Secondary','Corrugate','640 g','60% PCR','Complete'],
    ['Pallet','Tertiary','Wood','22 kg','0% PCR','Complete'],
    ['Pallet Wrap / Stretch','Tertiary','Plastic LDPE','320 g','15% PCR','Review needed'],
    ['Pallet Label','Tertiary','Paper GC1 - Coated FBB','1.8 g','40% PCR','Complete'],
    ['Fastener (cable tie/tape)','Tertiary','Plastic PP','3.1 g','0% PCR','Review needed'],
    ['Kraft Mailer','Secondary','Paper Kraft','28 g','90% PCR','Complete'],
    ['Bubble Wrap','Secondary','Plastic LDPE','40 g','10% PCR','Review needed'],
    ['Header Card','Primary','Cardboard/CartonBoard','6 g','60% PCR','Complete'],
    ['Ribbon Tie','Primary','Textile','2.2 g','0% PCR','Incomplete'],
    ['Glass Jar','Primary','Glass','210 g','30% PCR','Complete'],
    ['Metal Clip','Tertiary','Metal','1.4 g','0% PCR','Review needed'],
    ['Corner Protector','Tertiary','Corrugate','18 g','75% PCR','Complete'],
    ['Void Fill Paper','Secondary','Paper Kraft','30 g','100% PCR','Complete']
  ];
  var TOTAL = LIB.length;
  var READY = LIB.filter(function(r){ return r[5] === 'Complete'; }).length;
  var PCT = Math.round(READY / TOTAL * 100);
  var PACK = 'Luntai_Packaging_Library_2026-09.zip';
  var PRICE = '£29';            /* placeholder — pricing is a business decision */

  /* ── State (localStorage, all guarded) ────────────────────────────────── */
  var RULES = { snoozeDays: 14, retireAfter: 2, perSession: 1 };
  function lget(k, d){ try{ var v = localStorage.getItem('up_' + k); return v === null ? d : JSON.parse(v); }catch(e){ return d; } }
  function lset(k, v){ try{ localStorage.setItem('up_' + k, JSON.stringify(v)); }catch(e){} }
  function sget(k){ try{ return sessionStorage.getItem('up_' + k); }catch(e){ return null; } }
  function sset(k, v){ try{ sessionStorage.setItem('up_' + k, v); }catch(e){} }
  function isPro(){ return lget('plan', 'free') === 'pro'; }

  /* May this proactive prompt show now? Records the impression if yes. */
  function mayPrompt(id){
    if(isPro()) return false;
    var d = lget('dismiss_' + id, { n: 0, at: 0 });
    if(d.n >= RULES.retireAfter) return false;
    if(d.at && Date.now() - d.at < RULES.snoozeDays * 864e5) return false;
    var shown = sget('shown');
    if(shown && shown !== id) return false;        /* one prompt per session */
    sset('shown', id);
    return true;
  }
  function dismiss(id, el){
    var d = lget('dismiss_' + id, { n: 0, at: 0 });
    lset('dismiss_' + id, { n: d.n + 1, at: Date.now() });
    if(el){ el.style.transition = 'opacity .2s,transform .2s'; el.style.opacity = '0'; el.style.transform = 'translateY(-4px)';
      setTimeout(function(){ el.remove(); }, 200); }
  }

  /* ── Page detection ───────────────────────────────────────────────────── */
  var STEM = (location.pathname.split('/').pop() || '')
    .replace(/-Light\.html$/i, '').replace(/\.html$/i, '').replace(/^04-greenstreets_supplier_portal_/, '');
  var LIGHT = /-Light\.html$/i.test(location.pathname);

  /* ── Icons ─────────────────────────────────────────────────────────────── */
  function ic(p, s){ return '<svg width="' + (s||14) + '" height="' + (s||14) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; }
  var I = {
    pack:  ic('<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>', 16),
    share: ic('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>'),
    dl:    ic('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'),
    link:  ic('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'),
    check: ic('<polyline points="20 6 9 17 4 12"/>'),
    dash:  ic('<line x1="6" y1="12" x2="18" y2="12"/>'),
    x:     ic('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>', 13),
    star:  ic('<path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z"/>', 9),
    file:  ic('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>', 13),
    dir:   ic('<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>', 13)
  };
  var CHIP = '<span class="up-chip">' + I.star + 'Pro</span>';
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function el(html){ var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }

  /* ── Toast ────────────────────────────────────────────────────────────── */
  function toast(html, ms){
    var t = document.querySelector('.up-toast'); if(t) t.remove();
    t = el('<div class="up-toast" role="status">' + html + '</div>');
    document.body.appendChild(t);
    requestAnimationFrame(function(){ t.classList.add('on'); });
    setTimeout(function(){ t.classList.add('on'); }, 30);
    clearTimeout(toast._t);
    toast._t = setTimeout(function(){ t.classList.remove('on'); setTimeout(function(){ t.remove(); }, 300); }, ms || 5200);
    return t;
  }

  /* ── Downloads (demo: the "pack" is a CSV of the library) ─────────────── */
  function csv(rows){
    var head = ['Component','Level','Material','Weight','Recycled content','Status'];
    return [head].concat(rows).map(function(r){ return r.map(function(c){ return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n');
  }
  function save(name, text){
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ── Overlay plumbing ─────────────────────────────────────────────────── */
  function closeOverlays(){
    document.querySelectorAll('.up-drawer,.up-modal,.up-shade').forEach(function(n){
      n.classList.remove('on'); setTimeout(function(){ n.remove(); }, 280);
    });
    document.removeEventListener('keydown', onEsc);
  }
  function onEsc(e){ if(e.key === 'Escape') closeOverlays(); }
  function openLayer(node){
    closeOverlays();
    var shade = el('<div class="up-shade"></div>');
    shade.addEventListener('click', closeOverlays);
    setTimeout(function(){
      document.body.appendChild(shade); document.body.appendChild(node);
      requestAnimationFrame(function(){ shade.classList.add('on'); node.classList.add('on'); });
      setTimeout(function(){ shade.classList.add('on'); node.classList.add('on'); }, 30);
      document.addEventListener('keydown', onEsc);
      var f = node.querySelector('[data-up-focus]'); if(f) f.focus();
    }, 0);
  }

  /* ── Export preview drawer — value first, price last ──────────────────── */
  function openExport(source, names){
    var pro = isPro();
    var pick = names && names.length ? LIB.filter(function(r){ return names.indexOf(r[0]) >= 0; }) : null;
    var n = pick ? pick.length : TOTAL;
    var src = pick ? pick.concat(LIB.filter(function(r){ return names.indexOf(r[0]) < 0; })) : LIB;
    var rows = src.slice(0, 7).map(function(r, i){
      return '<tr' + (!pro && i >= 3 ? ' class="bl"' : '') + '><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td><td>' + esc(r[3]) + '</td><td>' + esc(r[4]) + '</td></tr>';
    }).join('');
    var d = el(
      '<aside class="up-drawer" role="dialog" aria-modal="true" aria-label="Export your packaging library">' +
        '<div class="up-d-hdr"><div style="flex:1">' +
          '<h2>' + (pick ? 'Export ' + n + ' selected component' + (n > 1 ? 's' : '') : 'Your library, as one file') + ' ' + (pro ? '' : CHIP) + '</h2>' +
          '<p>' + (pick ? 'Exporting a selection is part of Library Pro. The file is tidy and retailer-ready, so you can send it to any customer or partner supplier.' : 'Every component, declaration and spec sheet, in the format retailers ask for. Send one file instead of re-typing the same data for each customer.') + '</p>' +
        '</div><button class="up-x" style="position:static" onclick="GSUpsell.close()" aria-label="Close">' + I.x + '</button></div>' +
        '<div class="up-d-body">' +
          '<div><div class="up-h">What’s in the pack</div><div class="up-tree">' +
            '<div>' + I.pack + '<b>' + PACK + '</b><span class="sz">4.8 MB</span></div>' +
            '<div class="in">' + I.file + 'packaging-library.xlsx<span class="sz">' + TOTAL + ' components</span></div>' +
            '<div class="in">' + I.dir + 'declarations/<span class="sz">' + READY + ' DoCs</span></div>' +
            '<div class="in">' + I.dir + 'spec-sheets/<span class="sz">31 files</span></div>' +
            '<div class="in">' + I.file + 'README · version &amp; share link<span class="sz">1 KB</span></div>' +
          '</div></div>' +
          '<div><div class="up-h">Preview · packaging-library.xlsx</div><div class="up-sheet"><table>' +
            '<thead><tr><th>Component</th><th>Level</th><th>Material</th><th>Weight</th><th>Recycled</th></tr></thead><tbody>' + rows + '</tbody></table>' +
            (pro ? '' : '<div class="up-sheet-more">' + (pick ? (n > 3 ? '+ ' + (n - 3) + ' more selected · ' : '') + 'or export the whole library (' + TOTAL + ')' : '+ ' + (TOTAL - 3) + ' more components in the full pack') + '</div>') +
          '</div></div>' +
          '<div><div class="up-h">Share it with</div><div class="up-recip">' +
            '<div><b>Another retailer</b>Columns already follow the Greenstreets schema, so it imports directly.</div>' +
            '<div><b>A partner supplier</b>A view-only link that you can revoke at any time.</div>' +
          '</div></div>' +
          '<div><div class="up-h">Readiness</div>' +
            '<div style="font-size:12px;color:var(--up-ink-2)"><b style="color:var(--up-ink)">' + READY + ' of ' + TOTAL + '</b> components are complete. The rest go into the pack flagged as “in review”.</div>' +
            '<div class="up-meter"><i style="width:' + PCT + '%"></i></div>' +
          '</div>' +
        '</div>' +
        '<div class="up-d-foot">' + (pro
          ? '<button class="up-btn up-btn-pro" data-up-focus onclick="GSUpsell.download()">' + I.dl + 'Download pack</button>' +
            '<button class="up-btn" onclick="GSUpsell.copyLink()">' + I.link + 'Copy share link</button>'
          : '<button class="up-btn up-btn-pro" data-up-focus onclick="GSUpsell.plans(\'' + esc(source || 'drawer') + '\')">See Library Pro, from ' + PRICE + '/month</button>' +
            '<div class="up-fine">14-day free trial · cancel anytime · submitting to Primark stays free on every plan' + (pick ? '<br>Declarations of Conformity stay free from each row’s DoC button.' : '') + '</div>') +
        '</div>' +
      '</aside>');
    openLayer(d);
  }

  /* ── Plans modal ──────────────────────────────────────────────────────── */
  function li(on, t){ return '<li class="' + (on ? '' : 'off') + '">' + (on ? I.check : I.dash) + '<span>' + t + '</span></li>'; }
  function openPlans(){
    var m = el(
      '<div class="up-modal" role="dialog" aria-modal="true" aria-label="Plans">' +
        '<div style="display:flex;align-items:flex-start;gap:10px"><div style="flex:1">' +
          '<div style="font-size:17px;font-weight:700;color:var(--up-ink)">Take your library anywhere</div>' +
          '<div style="font-size:12px;color:var(--up-ink-2);margin-top:4px">You’ve already done the hard part and built the library. Library Pro lets you reuse it with every customer.</div>' +
        '</div><button class="up-x" style="position:static" onclick="GSUpsell.close()" aria-label="Close">' + I.x + '</button></div>' +
        '<div class="up-plans">' +
          '<div class="up-plan"><div class="up-plan-n">Free</div><div class="up-plan-p">£0 <small>included by Primark</small></div><ul class="up-ben">' +
            li(1, 'Build and edit your packaging library') + li(1, 'Submit to Primark') + li(1, 'Download Declarations of Conformity') +
            li(1, 'Share one component (once)') + li(0, 'Export the whole library') + li(0, 'Share links for other retailers &amp; suppliers') +
          '</ul><button class="up-btn" style="margin-top:auto" disabled>Your current plan</button></div>' +
          '<div class="up-plan pro"><div class="up-plan-n">Library Pro ' + CHIP + '</div><div class="up-plan-p">' + PRICE + ' <small>/ month</small></div><ul class="up-ben">' +
            li(1, '<b>Everything in Free</b>') + li(1, '<b>One-click library pack</b>: sheet, DoCs and spec sheets') +
            li(1, 'Retailer-ready columns, no reformatting') + li(1, 'Revocable share links for partners') +
            li(1, 'Documents bundled into the pack') + li(1, 'Export history &amp; versions') +
          '</ul><button class="up-btn up-btn-pro" style="margin-top:auto" data-up-focus onclick="GSUpsell.trial()">Start 14-day free trial</button></div>' +
        '</div>' +
        '<div class="up-fine" style="margin-top:14px">No card needed for the trial. Your data stays yours on every plan.</div>' +
      '</div>');
    openLayer(m);
  }

  /* ── Public API (used by inline onclicks) ─────────────────────────────── */
  window.GSUpsell = {
    open: openExport,
    plans: openPlans,
    close: closeOverlays,
    trial: function(){
      lset('plan', 'pro'); closeOverlays();
      toast(I.check + '<span>Library Pro trial started. Your pack is ready.</span><button class="up-btn up-btn-pro" style="height:26px" onclick="GSUpsell.open()">Open</button>');
      rerender();
    },
    download: function(){ save(PACK.replace('.zip', '.csv'), csv(LIB)); lset('exports', lget('exports', 0) + 1); toast(I.check + '<span>Pack downloaded (demo: CSV of the sheet).</span>'); },
    copyLink: function(){
      var u = 'https://share.greenstreets.io/l/luntai-7Fq2';
      try{ navigator.clipboard.writeText(u); }catch(e){}
      toast(I.link + '<span>View-only link copied. You can revoke it any time from Settings.</span>');
    },
    freeOne: function(name){
      var row = LIB.filter(function(r){ return r[0] === name; })[0] || LIB[0];
      lset('freeUsed', true); save(row[0].replace(/\W+/g, '_') + '_spec.csv', csv([row]));
      closePop();
      toast('<span>' + esc(row[0]) + ' exported. Want the other ' + (TOTAL - 1) + ' in one file?</span><button class="up-btn" style="height:26px" onclick="GSUpsell.open(\'free-taste\')">See the pack</button>', 7000);
    },
    dismiss: function(id, btn){ dismiss(id, btn.closest('.up-card')); },
    setPlan: function(p){ lset('plan', p); rerender(); },
    reset: function(){
      try{ Object.keys(localStorage).forEach(function(k){ if(k.indexOf('up_') === 0) localStorage.removeItem(k); });
           Object.keys(sessionStorage).forEach(function(k){ if(k.indexOf('up_') === 0) sessionStorage.removeItem(k); }); }catch(e){}
      location.reload();
    }
  };

  /* ══ Touchpoints ═════════════════════════════════════════════════════════ */

  /* 1 · Sidebar meter — passive, every page with the shell. */
  function sidebar(){
    var sb = document.querySelector('.sidebar'); if(!sb) return;
    var old = sb.querySelector('.up-sb'); if(old) old.remove();
    var anchor = sb.querySelector('.sb-notif-wrap-sb'); if(!anchor) return;
    var pro = isPro();
    var n = el('<div class="up-sb" role="button" tabindex="0" onclick="GSUpsell.open(\'sidebar\')" title="Export your packaging library">' +
      '<div class="up-sb-top"><span>Your library</span>' + (pro ? '' : CHIP) + '</div>' +
      '<div class="up-sb-n">' + TOTAL + ' components</div>' +
      '<div class="up-sb-s">' + (pro ? 'Export-ready · download the pack' : READY + ' ready to share as one pack') + '</div>' +
      '<div class="up-meter"><i style="width:' + PCT + '%"></i></div></div>');
    n.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); n.click(); } });
    anchor.parentNode.insertBefore(n, anchor);
  }

  /* 2 · Confirmation — the peak moment, right after an import succeeds. */
  function confirmation(){
    var host = document.querySelector('#sp9-sub'); if(!host) return;
    var col = host.parentNode;
    if(!mayPrompt('confirm')) return;
    var card = el('<div class="up-card" style="margin-top:14px">' +
      '<div class="up-card-ic">' + I.pack + '</div><div style="flex:1;padding-right:18px">' +
        '<div class="up-card-t">Your library now holds ' + TOTAL + ' components ' + CHIP + '</div>' +
        '<div class="up-card-s">Package it as one tidy file you can send to any retailer or partner supplier, so you don’t have to enter it again.</div>' +
        '<div class="up-card-act"><button class="up-btn" onclick="GSUpsell.open(\'confirmation\')">Preview the pack</button>' +
        '<button class="up-link" onclick="GSUpsell.dismiss(\'confirm\',this)">Not now</button></div>' +
      '</div><button class="up-x" onclick="GSUpsell.dismiss(\'confirm\',this)" aria-label="Dismiss">' + I.x + '</button></div>');
    col.appendChild(card);
  }

  /* 3 · Packaging listing — a permanent Export button + one readiness banner. */
  function packaging(){
    var ai = document.getElementById('pkg-import-ai-btn'); if(!ai) return;
    var old = document.getElementById('up-export-btn'); if(old) old.remove();
    var pro = isPro();
    var b = el('<button id="up-export-btn" class="up-btn" onclick="GSUpsell.open(\'packaging-button\')">' + I.dl + 'Export library ' + (pro ? '' : CHIP) + '</button>');
    ai.parentNode.insertBefore(b, ai);

    selectionExport();

    var ob = document.getElementById('up-pkg-banner'); if(ob) ob.remove();
    /* after a wizard save, a toast wins over the banner (same one-per-session budget) */
    if(sget('wizSaved')){
      try{ sessionStorage.removeItem('up_wizSaved'); }catch(e){}
      if(mayPrompt('wizard')){
        setTimeout(function(){
          toast(I.check + '<span>Saved to your library: <b>' + (TOTAL + 1) + ' components</b>. Export them all with Pro.</span><button class="up-btn" style="height:26px" onclick="GSUpsell.open(\'wizard\')">Preview</button>', 7000);
        }, 700);
      }
      return;
    }
    if(!mayPrompt('pkg-banner')) return;
    var tb = document.querySelector('.ftb-host'); if(!tb) return;
    var banner = el('<div id="up-pkg-banner" class="up-card" style="margin-bottom:12px">' +
      '<div class="up-card-ic">' + I.share + '</div><div style="flex:1;padding-right:18px">' +
        '<div class="up-card-t">' + READY + ' of ' + TOTAL + ' components are ready to share ' + CHIP + '</div>' +
        '<div class="up-card-s">Other retailers ask for the same data. Send them your library as one file and skip re-entering it.</div>' +
        '<div class="up-meter" style="max-width:320px"><i style="width:' + PCT + '%"></i></div>' +
        '<div class="up-card-act"><button class="up-btn" onclick="GSUpsell.open(\'packaging-banner\')">See what the file looks like</button>' +
        '<button class="up-link" onclick="GSUpsell.dismiss(\'pkg-banner\',this)">Not now</button></div>' +
      '</div><button class="up-x" onclick="GSUpsell.dismiss(\'pkg-banner\',this)" aria-label="Dismiss">' + I.x + '</button></div>');
    tb.parentNode.insertBefore(banner, tb);
  }

  /* 3b · Selection bar — the listing's "Download" becomes "Export" + Pro chip.
     The bar is built lazily on the first tick (gsPkgBuildBulkBar), so the
     builder is wrapped and the button re-labelled every time it exists. */
  function selNames(){
    var rows = typeof window.gsPkgSelectedRows === 'function' ? window.gsPkgSelectedRows() : [];
    return rows.map(function(r){ var n = r.querySelector('.pkg-tbl-name-main') || r.querySelector('.pkg-tbl-name'); return n ? n.textContent.trim() : ''; }).filter(Boolean);
  }
  function labelSelBtn(){
    var b = document.querySelector('.ftb-sel button[onclick="gsPkgBulkDownload()"]'); if(!b) return;
    var span = b.querySelector('span'); if(span) span.textContent = 'Export';
    b.title = 'Export the selected components as one shareable file';
    var chip = b.querySelector('.up-chip');
    if(isPro()){ if(chip) chip.remove(); }
    else if(!chip){ b.insertAdjacentHTML('beforeend', CHIP); b.style.gap = '6px'; }
  }
  function selectionExport(){
    if(typeof window.gsPkgBuildBulkBar === 'function' && !window.gsPkgBuildBulkBar._up){
      var build = window.gsPkgBuildBulkBar;
      window.gsPkgBuildBulkBar = function(){ var r = build.apply(this, arguments); labelSelBtn(); return r; };
      window.gsPkgBuildBulkBar._up = true;
    }
    /* the button keeps its inline onclick — route that name to the export flow */
    window.gsPkgBulkDownload = function(){
      var names = selNames(); if(!names.length) return;
      if(isPro()){
        var rows = LIB.filter(function(r){ return names.indexOf(r[0]) >= 0; });
        save('Luntai_Packaging_Selection_' + rows.length + '.csv', csv(rows));
        lset('exports', lget('exports', 0) + 1);
        toast(I.check + '<span>' + rows.length + ' component' + (rows.length > 1 ? 's' : '') + ' exported (demo: CSV).</span>');
      } else openExport('selection', names);
    };
    labelSelBtn();
  }

  /* 4 · Packaging detail pages — "Share spec" beside Download DoC. */
  function closePop(){ var p = document.querySelector('.up-pop'); if(p) p.remove(); }
  function detail(){
    var dl = document.querySelector('.pkg-doc-download-btn'); if(!dl) return;
    var old = document.getElementById('up-share-btn'); if(old) old.remove();
    var name = (document.querySelector('.pkg-detail-title, .pkg-detail-name, h1') || {}).textContent || '';
    name = name.trim() || STEM.replace(/^Packaging-/, '').replace(/-/g, ' ');
    var match = LIB.filter(function(r){ return r[0].toLowerCase() === name.toLowerCase(); })[0];
    var comp = match ? match[0] : STEM.replace(/^Packaging-/, '').replace(/-/g, ' ');
    var b = el('<button id="up-share-btn" class="up-btn" style="height:36px">' + I.share + 'Share spec</button>');
    b.addEventListener('click', function(e){
      e.stopPropagation();
      if(document.querySelector('.up-pop')){ closePop(); return; }
      var pro = isPro(), used = lget('freeUsed', false);
      var r = b.getBoundingClientRect(), host = document.body;
      var pop = el('<div class="up-pop" role="menu">' +
        (pro
          ? '<div class="up-pop-row" onclick="GSUpsell.copyLink()">' + I.link + '<div><b>Copy view-only link</b><span>For this component. Revocable.</span></div></div>'
          : (used
            ? '<div class="up-pop-row" style="cursor:default;opacity:.6">' + I.dl + '<div><b>Export this component</b><span>You’ve used your free single export.</span></div></div>'
            : '<div class="up-pop-row" onclick="GSUpsell.freeOne(\'' + esc(comp).replace(/'/g, "\\'") + '\')">' + I.dl + '<div><b>Export this component <span class="up-chip" style="background:none;border-color:var(--up-card-line);color:var(--up-ink-2)">Free · once</span></b><span>A spec sheet for ' + esc(comp) + ', ready to send.</span></div></div>')) +
        '<div class="up-pop-row" onclick="GSUpsell.open(\'detail\')">' + I.pack + '<div><b>Share the whole library ' + (pro ? '' : CHIP) + '</b><span>All ' + TOTAL + ' components, DoCs and spec sheets in one pack.</span></div></div>' +
        '</div>');
      host.appendChild(pop);
      var w = 300;
      pop.style.top = (r.bottom + window.scrollY + 8) + 'px';
      pop.style.left = Math.max(12, Math.min(r.right + window.scrollX - w, window.innerWidth - w - 12)) + 'px';
    });
    dl.parentNode.insertBefore(b, dl);
  }
  document.addEventListener('click', function(e){ var p = document.querySelector('.up-pop'); if(p && !p.contains(e.target)) closePop(); });

  /* 5 · AI Upload — they already know the format; say it works both ways. */
  function aiUpload(){
    var t = document.querySelector('button[onclick="downloadSpecTemplate()"]'); if(!t || isPro()) return;
    if(document.getElementById('up-ai-hint')) return;
    t.insertAdjacentElement('afterend', el('<div id="up-ai-hint" class="up-hint">Already have a library? You can export it in this same format. <button onclick="GSUpsell.open(\'ai-upload\')">See how</button>' + CHIP + '</div>'));
  }

  /* 6 · Documents — the pack can carry these too. */
  function documents(){
    var inp = document.querySelector('input[type=file][onchange*="docsHandleUpload"]'); if(!inp || isPro()) return;
    var zone = inp.closest('div'); if(!zone || document.getElementById('up-doc-hint')) return;
    var h = el('<div id="up-doc-hint" class="up-hint" style="margin:-4px 0 12px">Documents uploaded here can go into your library pack with the components they belong to. <button onclick="GSUpsell.open(\'documents\')">Preview</button>' + CHIP + '</div>');
    zone.insertAdjacentElement('afterend', h);
  }

  /* 7 · Welcome — an OPTIONAL 4th step, outside the numbered three. */
  function welcome(){
    var steps = document.getElementById('onb-steps'); if(!steps || document.getElementById('up-onb')) return;
    var s = el('<div id="up-onb" class="onb-step up-onb">' +
      '<div class="onb-num">+</div><div class="onb-txt">' +
        '<h3>Later: share your library anywhere ' + CHIP + '</h3>' +
        '<p>Once your library is built, you can package it as one file for other retailers or partner suppliers. This is optional, and nothing Primark needs depends on it.</p>' +
        '<button class="onb-cta ghost" onclick="GSUpsell.open(\'welcome\')">' + I.pack.replace('width="16" height="16"', 'width="13" height="13"') + 'See an example pack</button>' +
      '</div></div>');
    steps.insertAdjacentElement('afterend', s);
  }

  /* 8 · Settings — the honest, always-there place for the plan. */
  function settings(){
    var body = document.querySelector('.set-body'); if(!body) return;
    var old = document.getElementById('up-set'); if(old) old.remove();
    var pro = isPro(), ex = lget('exports', 0);
    var c = el('<div class="set-card" id="up-set"><div class="set-hdr">Plan &amp; billing</div><div class="set-inner">' +
      '<div class="up-set-row"><div>' +
        '<div class="up-set-plan">' + (pro ? 'Library Pro ' + CHIP : 'Free') + '</div>' +
        '<div class="up-set-s">' + (pro ? 'Trial · 14 days left · then ' + PRICE + '/month' : 'Included by Primark: build, submit and download DoCs.') + '</div>' +
      '</div>' + (pro
        ? '<button class="up-btn" onclick="GSUpsell.open(\'settings\')">' + I.dl + 'Export library</button>'
        : '<button class="up-btn up-btn-pro" onclick="GSUpsell.plans()">Compare plans</button>') + '</div>' +
      '<div style="margin-top:14px"><div class="up-set-s" style="margin:0 0 4px">Library size: <b style="color:var(--up-ink)">' + TOTAL + ' components</b> · ' + READY + ' export-ready</div>' +
        '<div class="up-meter" style="max-width:360px"><i style="width:' + PCT + '%"></i></div></div>' +
      '<div class="up-hist"><b style="color:var(--up-ink-2)">Export history</b><br>' +
        (ex ? ex + ' pack' + (ex > 1 ? 's' : '') + ' downloaded · 1 active share link' : 'No exports yet. Your packs and share links will be listed here.') + '</div>' +
    '</div></div>');
    var first = body.querySelector('.set-card');
    if(first && first.nextSibling) body.insertBefore(c, first.nextSibling); else body.appendChild(c);
  }

  /* 9 · Component Wizard — flag the save; the Packaging page shows the toast. */
  function wizard(){
    if(typeof window.confirmSubmit !== 'function' || window.confirmSubmit._up) return;
    var orig = window.confirmSubmit;
    window.confirmSubmit = function(){ sset('wizSaved', '1'); return orig.apply(this, arguments); };
    window.confirmSubmit._up = true;
  }

  /* ── Demo control — reviewer aid, labelled as such ────────────────────── */
  function demo(){
    if(STEM === 'Login' || STEM === 'Login-Blobs') return;
    var o = document.querySelector('.up-demo'); if(o) o.remove();
    var pro = isPro();
    document.body.appendChild(el('<div class="up-demo" title="Exploration control, not product UI"><b>Upsell demo</b>' +
      '<button class="' + (pro ? '' : 'on') + '" onclick="GSUpsell.setPlan(\'free\')">Free</button>' +
      '<button class="' + (pro ? 'on' : '') + '" onclick="GSUpsell.setPlan(\'pro\')">Pro</button>' +
      '<button onclick="GSUpsell.reset()" title="Clear dismissals, the session cap and the plan">Reset</button></div>'));
  }

  function rerender(){ sidebar(); packaging(); detail(); settings(); demo();
    if(isPro()){ ['up-ai-hint','up-doc-hint','up-pkg-banner'].forEach(function(id){ var n = document.getElementById(id); if(n) n.remove(); }); } }

  function init(){
    sidebar();
    if(STEM === 'Confirmation') confirmation();
    if(STEM === 'Packaging') packaging();
    if(/^Packaging-/.test(STEM)) detail();
    if(STEM === 'AI-Upload') aiUpload();
    if(STEM === 'Documents') documents();
    if(STEM === 'Welcome') welcome();
    if(STEM === 'Settings') settings();
    if(STEM === 'Component-Wizard') wizard();
    /* AI-Processing / AI-Review-1..3: intentionally nothing — the user is concentrating. */
    demo();
  }
  /* the shell mounts the sidebar on DOMContentLoaded; run after it */
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, 0); });
  else setTimeout(init, 0);
})();

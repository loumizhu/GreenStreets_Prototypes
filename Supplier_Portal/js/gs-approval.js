/* Packaging approval layer (Supplier Portal: self-approval).
   The Download-DoC controls are gated behind an approval: until the component is approved the DoC
   button is replaced by a primary "Self-approve" button (.btn-p); once approved the DoC button returns
   next to a secondary "Cancel approval" (.btn-g / .btn-g-sm). Standard components only.
   Works on the static markup already on the page: any control whose onclick calls downloadDoC('<key>')
   (detail: .pkg-doc-download-btn, listing: .pkg-doc-dl-btn) is promoted at load, and re-promoted when the
   listing re-renders. State is a { key: true } map in localStorage so it survives page-to-page navigation.
   window.GS_APPR_LABEL overrides the button label (Super Admin uses "Approve"). */
(function () {
  var KEY = 'gs_pkg_approved';
  var LABEL = window.GS_APPR_LABEL || 'Self-approve';
  var CHECK = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" style="margin-right:5px;position:relative;top:-1px"><polyline points="20 6 9 17 4 12"></polyline></svg>';

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  function save(m) { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {} }
  window.gsPkgApproved = function (k) { return !!load()[k]; };

  function keyOf(btn) { var m = (btn.getAttribute('onclick') || '').match(/downloadDoC\('([^']+)'\)/); return m ? m[1] : null; }
  function nameOf(k) {
    var lib = window.COMPONENT_LIBRARY_JS, c = lib && lib.filter ? lib.filter(function (x) { return x.key === k; })[0] : null;
    return c && c.name ? c.name : k.replace(/_/g, ' ');
  }
  function toast(msg) { if (typeof window.gsToast === 'function') window.gsToast(msg); }

  /* small confirmation dialog — the existing .pkg-modal surface */
  function confirmCancel(k, done) {
    var ov = document.createElement('div');
    ov.className = 'pkg-modal-overlay open';
    ov.innerHTML = '<div class="pkg-modal" role="dialog" aria-modal="true"><div class="pkg-modal-hdr"><span class="pkg-modal-title">Cancel approval?</span></div>' +
      '<div style="padding:16px 20px;font-size:12.5px;line-height:1.5;color:var(--tw2)">The approval of &ldquo;' + nameOf(k) + '&rdquo; will be withdrawn and its Declaration of Conformity will be unavailable until you approve it again.</div>' +
      '<div class="pkg-modal-footer" style="display:flex;justify-content:flex-end;gap:8px"><button class="btn-g" data-a="keep">Keep approved</button><button class="btn-p" data-a="ok">Cancel approval</button></div></div>';
    ov.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('[data-a]');
      if (a || e.target === ov) { ov.remove(); if (a && a.getAttribute('data-a') === 'ok') done(); }
    });
    document.body.appendChild(ov);
  }

  function setApproved(k, on) {
    var m = load(); if (on) m[k] = true; else delete m[k]; save(m);
    refresh();
  }
  window.gsPkgApprove = function (k, ev) {
    if (ev) ev.stopPropagation();
    setApproved(k, true); toast(nameOf(k) + ' approved — Declaration of Conformity now available');
  };
  window.gsPkgCancelApproval = function (k, ev) {
    if (ev) ev.stopPropagation();
    confirmCancel(k, function () { setApproved(k, false); toast('Approval of ' + nameOf(k) + ' cancelled'); });
  };

  function mk(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }

  function promote(doc) {
    var k = keyOf(doc); if (!k || doc.getAttribute('data-gs-appr')) return;
    var small = doc.classList.contains('pkg-doc-dl-btn');
    doc.setAttribute('data-gs-appr', k);
    var approve, cancel;
    if (small) {
      approve = mk('<button class="btn-p" title="Approve this component to unlock its Declaration of Conformity" style="height:24px;display:inline-flex;align-items:center;box-sizing:border-box;font-size:11px;padding:0 10px" onclick="gsPkgApprove(\'' + k + '\',event)">' + CHECK + LABEL + '</button>');
      cancel = mk('<button class="btn-g-sm" title="Cancel approval" style="margin-left:6px" onclick="gsPkgCancelApproval(\'' + k + '\',event)">Cancel approval</button>');
    } else {
      approve = mk('<button class="btn-p" title="Approve this component to unlock its Declaration of Conformity" onclick="gsPkgApprove(\'' + k + '\',event)">' + CHECK + LABEL + '</button>');
      cancel = mk('<button class="btn-g" title="Cancel approval" onclick="gsPkgCancelApproval(\'' + k + '\',event)">Cancel approval</button>');
    }
    approve.setAttribute('data-gs-appr-ctl', k); cancel.setAttribute('data-gs-appr-ctl', k);
    doc.parentNode.insertBefore(approve, doc);
    doc.parentNode.insertBefore(cancel, doc.nextSibling);
  }

  function refresh() {
    var m = load();
    document.querySelectorAll('[data-gs-appr]').forEach(function (doc) {
      var k = doc.getAttribute('data-gs-appr'), on = !!m[k];
      doc.style.display = on ? '' : 'none';
      document.querySelectorAll('[data-gs-appr-ctl="' + k + '"]').forEach(function (b) {
        if (b.parentNode !== doc.parentNode) return;
        var show = b.classList.contains('btn-p') ? !on : on;
        b.style.display = show ? '' : 'none';
      });
    });
  }

  function scan() {
    document.querySelectorAll('.pkg-doc-download-btn, .pkg-doc-dl-btn').forEach(promote);
    refresh();
  }
  var pending = false;
  function schedule() { if (pending) return; pending = true; requestAnimationFrame(function () { pending = false; scan(); }); }

  function init() {
    scan();
    try { new MutationObserver(function (recs) {
      for (var i = 0; i < recs.length; i++) if (recs[i].addedNodes.length) { schedule(); return; }
    }).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
    window.addEventListener('storage', schedule);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

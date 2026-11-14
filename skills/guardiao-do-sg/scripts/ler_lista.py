#!/usr/bin/env python3
"""Lê a lista mestra (xlsx) e imprime uma linha por documento, separada por TAB:
código, título, área, código interno, dentro de, status. Total no stderr.
Não grava nada: quem monta o índice é o agente."""
import sys, re, openpyxl
# uso: ler_lista.py ARQUIVO "col código" "col título" "col área" "col status" ["col código interno" "regex com (\d+)" "início do título com {n}"]
arq, c_cod, c_tit, c_area, c_st = sys.argv[1:6]
c_int, rx, pref = (sys.argv[6:9] + [None] * 3)[:3]
wb = openpyxl.load_workbook(arq, data_only=True)
ws = next((w for w in wb if "lista" in w.title.lower()), wb.active)
linhas = list(ws.iter_rows(values_only=True))
i = next(n for n, l in enumerate(linhas) if l and c_cod in [str(c).strip() for c in l if c is not None])
cab = [str(c).strip() if c is not None else "" for c in linhas[i]]
docs = []
for l in linhas[i + 1:]:
    d = {cab[k]: ("" if l[k] is None else str(l[k]).strip()) for k in range(len(cab)) if cab[k]}
    if re.match(r"^[A-Z]{2,5}-\d+", d.get(c_cod, "")):
        docs.append(d)
for d in docs:
    dentro = "—"
    if c_int and rx and pref:
        m = re.search(rx, d.get(c_int, ""))
        if m:
            alvo = pref.format(n=int(m.group(1)))
            casa = [x for x in docs if x.get(c_tit, "").startswith(alvo)]
            if casa and casa[0][c_cod] != d[c_cod]:
                dentro = casa[0][c_cod] + " (" + alvo + ")"
    print("\t".join([d[c_cod], d.get(c_tit, "")[:60], d.get(c_area, ""), d.get(c_int, "") if c_int else "", dentro, d.get(c_st, "")]))
print(f"TOTAL\t{len(docs)}", file=sys.stderr)

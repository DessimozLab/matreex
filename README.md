# Matreex
Matreex is a new dynamic tool to scale-up the visualisation of gene families. Matreex’ key idea is to use “phylogenetic” profiles to minimise the information loss when collapsing subtrees. These profiles are dense representations of gene repertoires but in themselves lack evolutionary relations. Thus combining the two approaches of subtree collapse and profiles provides both phylogenetic context and compact information. Furthermore, by building on the [phylo.IO viewer](https://beta.phylo.io/viewer/) framework, Matreex provides a very responsive user interface.

# Installation
Requires Python >= 3.6. Download the package from the PyPI, resolving the dependencies by using ``pip install matreex``.

Alternatively, clone this repository and install manually.

# Quick run
``matreex --src oma --ids HOG:C0677574 --out ./``

# Usage
Required arguments: ``--src``, ``--out``, ``--ids`` or (``--gt_custom`` and ``--st_custom``)

``usage: matreex [-h] [--version] --src {oma,panther,json} [--ids IDS] --out OUT [--root_taxon ROOT_TAXON] [--gt_custom GT_CUSTOM]
               [--st_custom ST_CUSTOM]``

# Arguments
| Flag                 | Default                | Description |
|:--------------------|:----------------------|:-----------|
| ``--src``||Source of gene family (oma, panther, json)
| ``--ids``||Csv list of HOG or family ids (e.g. HOG:C0677574,HOG:C0667455 for oma or PTHR11361 for panther)
| ``--out``||Path/to/name
| ``--root_taxon``|LUCA|Taxon used to prune the gene families
| ``--gt_custom``||Custom gene tree in json
| ``--st_custom``||Custom species tree in json

# Custom JSON inputs
Only consistent gene tree-species tree pairs are supported!

## Species tree format
| Property        | Required  | Description |
|:--------------------|:----------------------|:-----------|
|taxon|Yes|Must be unique and match the gene tree taxon properties
|description|No|Displayed below the matrix|
|color|No|Branch color|
|matrix_color|No|Darkest cell color|

## Gene tree format
| Property        | Required  | Description |
|:--------------------|:----------------------|:-----------|
|HOG|Yes|Must be unique and match the gene tree taxon properties
|taxon|Yes|Must match species tree taxon properties with topological consistency|
|event|Yes, on internal nodes|One of: speciation, duplication, loss, hgt|
|gene|No, on leaf nodes|Gene id|
|profile|Yes, on leaf nodes|{taxon: copy_nr} e.g. {"Eptatretus burgeri": "1"}|
|description|No|Displayed on the right of the matrix|

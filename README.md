# Matreex
Matreex is a new dynamic tool to scale-up the visualisation of gene families. Matreex’ key idea is to use “phylogenetic” profiles to minimise the information loss when collapsing subtrees. These profiles are dense representations of gene repertoires but in themselves lack evolutionary relations. Thus combining the two approaches of subtree collapse and profiles provides both phylogenetic context and compact information. Furthermore, by building on the [phylo.IO viewer](https://beta.phylo.io/viewer/) framework, Matreex provides a very responsive user interface.

# Installation
Requires Python >= 3.6. Download the package from the PyPI, resolving the dependencies by using ``pip install matreex``.

Alternatively, clone this repository and install manually with ``pip install .``.

# Quick runs
OMA: ``matreex --src oma --ids HOG:D0681745 --out ./``

PANTHER: ``matreex --src panther --ids PTHR11361 --out ./``

JSON (from the cloned repo): ``matreex --src json --out ./ --gt_custom paper_figures/opsins_gt.json --st_custom paper_figures/opsins_st.json``

# Usage
Required arguments: ``--src``, ``--out``, ``--ids`` or (``--gt_custom`` and ``--st_custom``)

``usage: matreex [-h] [--version] --src {oma,panther,json} [--ids IDS] --out OUT [--root_taxon ROOT_TAXON] [--gt_custom GT_CUSTOM]
               [--st_custom ST_CUSTOM]``

# Arguments
| Flag                 | Default                | Description |
|:--------------------|:----------------------|:-----------|
| ``--src``||Source of gene family (oma, panther, json)
| ``--ids``||Csv list of HOG or family ids (e.g. HOG:D0681745,HOG:D0679907 for oma or PTHR11361 for panther)
| ``--out``||Path/to/name
| ``--root_taxon``|LUCA|Taxon used to prune the gene families
| ``--gt_custom``||Custom gene tree in json
| ``--st_custom``||Custom species tree in json

# OMA
HOG idenfiers can be retrieved from [OMA](https://omabrowser.org/oma/home/) by searching, for instance, a UniProt identifier. For example, we can find [here](https://omabrowser.org/oma/search/?type=all&query=p53_rat) that P53_RAT belongs to HOG:D0622467.

# PANTHER
Family identifiers can be retrieved from [PANTHER](http://www.pantherdb.org/) similarly. For instance, we can find [here](http://www.pantherdb.org/panther/familyList.do?searchType=basic&fieldName=all&listType=6&fieldValue=P53_rat) that P53_RAT belongs to PTHR11447.

# Custom JSON inputs
Only consistent gene tree-species tree pairs are supported!

Example JSON files are provided in the folder ./paper_figures.

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

# Change log
##### Version 0.1.1
- Updated Species tree & example HOGs to match OMA version of July 2023.

#### Version 0.1.0
- Initial release

# License
   
Matreex is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Matreex is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with Matreex. If not, see <http://www.gnu.org/licenses/>.


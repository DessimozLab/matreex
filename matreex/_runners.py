"""
    Matreex

    This file is part of Matreex.

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
"""
import os
from .matreex import run_matreex_oma, run_matreex_panther

def run_matreex(args):
    """
    - src (oma, panther, json)
    - ids (HOG1,HOG2)
    - out (out_path + name)
    - root_taxon
    """
    ids = args.ids.split(',')
    out_path, name = os.path.split(args.out)
    if not out_path: out_path = './'
    if args.src == 'oma':
        run_matreex_oma(
            ids, out_path, taxon2description={}, taxon2branch_color={}, taxon2matrix_color={}, ref_taxon=args.root_taxon,
            ref_sp='', id2gene_name={}, fasta_fn=None, name=name, max_gene_nr=1000000, exp_json=False)
    elif args.src == 'panther':
        run_matreex_panther(
            ids, out_path, taxon2description={}, taxon2branch_color={}, taxon2matrix_color={},
            ref_taxon=args.root_taxon.capitalize(),
            id2gene_name={}, name=name, max_gene_nr=1000000, exp_json=False, LDO=True, disable_duplicates=False)

    elif args.src == 'json':
        pass



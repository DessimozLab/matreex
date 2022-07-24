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
from setuptools import setup, find_packages

name = 'matreex'
__version__ = None
with open('{:s}/__init__.py'.format(name), 'rt') as fp:
    for line in fp:
        if line.startswith('__version__'):
            exec(line.rstrip())

requirements = ['biopython', 'ete3', 'omadb', 'requests', 'pyham']

desc = 'Matreex: compact and interactive visualisation of large gene families using hierarchical phylogenetic profiles'

setup(
    name=name,
    version=__version__,
    author='Victor Rossier and Clement Train',
    email='victorrossier@hotmail.com',
    url='',
    description=desc,
    packages=find_packages(),
    install_requires=requirements,
    python_requires=">=3.6",
    license='LGPLv3',
    scripts=['bin/matreex'])

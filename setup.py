from distutils.core import setup
from setuptools import find_packages

setup(
    name='pretty-inline',
    version='develop',
    packages=find_packages(exclude=["example_project", "example_project.*"]),
    include_package_data=True,
    zip_safe=False,
    url='',
    license='',
    author='Fluxility',
    author_email='contact@fluxility.com',
    description='Improved layout for inline admin interface in Django'
)

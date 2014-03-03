from django.db import models


class Author(models.Model):
    name = models.CharField(max_length=255)


class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.ForeignKey(Author)


class AuthorTabular(Author):
    class Meta:
        proxy = True


class AuthorStacked(Author):
    class Meta:
        proxy = True
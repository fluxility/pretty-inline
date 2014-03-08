from django.db import models


class Author(models.Model):
    name = models.CharField(max_length=255)


class Book(models.Model):
    author = models.ForeignKey(Author)
    title = models.CharField(max_length=255)
    eancode = models.CharField(max_length=255)
    description = models.TextField()
    language = models.CharField(max_length=7, choices=[("dutch", "Dutch"), ("english", "English")])


class Address(models.Model):
    author = models.ForeignKey(Author)
    street = models.CharField(max_length=100)
    postal = models.CharField(max_length=100)
    city = models.CharField(max_length=100)

class AuthorTabular(Author):
    class Meta:
        proxy = True


class AuthorStacked(Author):
    class Meta:
        proxy = True


class AuthorPretty(Author):
    class Meta:
        proxy = True
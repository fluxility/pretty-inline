from django.contrib import admin
from myapp.models import Author, Book
from pretty_inline import PrettyInline


class BookInline(PrettyInline):
    model = Book


class AuthorAdmin(admin.ModelAdmin):
    inlines = [BookInline, ]


admin.site.register(Author, AuthorAdmin)
admin.site.register(Book)
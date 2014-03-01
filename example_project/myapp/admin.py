from django.contrib import admin
from myapp.models import Author, Book
from pretty_inline.admin import TabularInline


class BookInline(TabularInline):
    model = Book
    max_num = 5

class AuthorAdmin(admin.ModelAdmin):
    inlines = [BookInline, ]


admin.site.register(Author, AuthorAdmin)
admin.site.register(Book)
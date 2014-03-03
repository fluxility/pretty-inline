from django.contrib import admin
from myapp.models import Book, AuthorTabular, AuthorStacked
from pretty_inline.admin import TabularInline, StackedInline


class BookTabularInline(TabularInline):
    model = Book
    max_num = 5


class BookStackedInline(StackedInline):
    model = Book
    max_num = 5


class AuthorTabularAdmin(admin.ModelAdmin):
    inlines = [BookTabularInline, ]


class AuthorStackedAdmin(admin.ModelAdmin):
    inlines = [BookStackedInline, ]


admin.site.register(AuthorTabular, AuthorTabularAdmin)
admin.site.register(AuthorStacked, AuthorStackedAdmin)
admin.site.register(Book)
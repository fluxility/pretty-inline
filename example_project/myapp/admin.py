from django.contrib import admin
from myapp.models import Book, Author, AuthorTabular, AuthorStacked
from pretty_inline.admin import TabularInline, StackedInline


class BookRegularTabularInline(admin.TabularInline):
    model = Book
    max_num = 5


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


class AuthorRegularTabularAdmin(admin.ModelAdmin):
    inlines = [BookRegularTabularInline]

admin.site.register(AuthorTabular, AuthorTabularAdmin)
admin.site.register(AuthorStacked, AuthorStackedAdmin)
admin.site.register(Author, AuthorRegularTabularAdmin)
admin.site.register(Book)
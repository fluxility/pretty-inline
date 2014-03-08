from django.contrib import admin
from myapp.models import Book, Author, AuthorTabular, AuthorStacked, AuthorPretty, Address
from pretty_inline.admin import TabularInline, StackedInline, PrettyInline


class BookRegularTabularInline(admin.StackedInline):
    model = Book
    max_num = 5


class BookTabularInline(TabularInline):
    model = Book
    max_num = 5


class BookStackedInline(StackedInline):
    model = Book
    max_num = 5


class BookPrettyInline(PrettyInline):
    model = Book
    max_num = 5


class AddressPrettyInline(PrettyInline):
    model = Address


class AuthorTabularAdmin(admin.ModelAdmin):
    inlines = [BookTabularInline, ]


class AuthorStackedAdmin(admin.ModelAdmin):
    inlines = [BookStackedInline, ]


class AuthorRegularTabularAdmin(admin.ModelAdmin):
    inlines = [BookRegularTabularInline]


class AuthorPrettyAdmin(admin.ModelAdmin):
    inlines = [BookPrettyInline, AddressPrettyInline]

admin.site.register(AuthorTabular, AuthorTabularAdmin)
admin.site.register(AuthorStacked, AuthorStackedAdmin)
admin.site.register(AuthorPretty, AuthorPrettyAdmin)
admin.site.register(Author, AuthorRegularTabularAdmin)
admin.site.register(Book)
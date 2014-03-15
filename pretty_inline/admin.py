from django.conf import settings
from django.contrib.admin.options import InlineModelAdmin
from django.contrib.admin.templatetags.admin_static import static
from django.contrib.admin import TabularInline as BaseTabularInline
from django.contrib.admin import StackedInline as BaseStackedInline
from django.forms import forms


class BaseInlineModelAdmin(InlineModelAdmin):
    @property
    def media(self):
        from django import VERSION as DJANGO_VERSION

        media = super(BaseInlineModelAdmin, self).media

        if DJANGO_VERSION[0] is 1 and DJANGO_VERSION[1] < 6:
            media.add_js(['//code.jquery.com/jquery-1.11.0.min.js'])

        media.add_css({
            "all": [static('pretty_inline/css/baseInlineFormset.css')]
        })
        media.add_js([static('libs/jquery.fix.clone.js')])
        media.add_js([static('pretty_inline/js/baseInlineFormset.js')])


        return media

    extra = 0


class TabularInline(BaseInlineModelAdmin, BaseTabularInline):
    template = 'pretty_inline/edit_inline/tabular.html'


class StackedInline(BaseInlineModelAdmin, BaseStackedInline):
    template = 'pretty_inline/edit_inline/stacked.html'


class PrettyInline(BaseInlineModelAdmin):
    template = 'pretty_inline/edit_inline/pretty.html'


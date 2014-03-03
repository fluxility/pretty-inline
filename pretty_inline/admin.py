from django.conf import settings
from django.contrib.admin.options import InlineModelAdmin
from django.contrib.admin.templatetags.admin_static import static
from django.contrib.admin import TabularInline as BaseTabularInline
from django.contrib.admin import StackedInline as BaseStackedInline
from django.forms import forms


class BaseInlineModelAdmin(InlineModelAdmin):
    @property
    def media(self):
        media = super(BaseInlineModelAdmin, self).media

        media.add_css({
            "all": [static('pretty_inline/css/baseInlineFormset.css')]
        })
        media.add_js([static('pretty_inline/js/baseInlineFormset.js')])

        return media


class TabularInline(BaseInlineModelAdmin, BaseTabularInline):
    template = 'pretty_inline/edit_inline/tabular.html'


class StackedInline(BaseInlineModelAdmin, BaseStackedInline):
    template = 'pretty_inline/edit_inline/stacked.html'


class PrettyInline(InlineModelAdmin):
    template = 'pretty_inline/edit_inline/pretty.html'
    extra = 0

    @property
    def media(self):
        files = ['pretty_inline.js']

        js = super(PrettyInline, self).media
        js.add_js([static('pretty_inline/js/%s' % f) for f in files])
        return js

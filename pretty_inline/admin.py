from django.conf import settings
from django.contrib.admin.options import InlineModelAdmin
from django.contrib.admin.templatetags.admin_static import static
from django.contrib.admin import TabularInline as BaseTabularInline
from django.contrib.admin import StackedInline as BaseStackedInline
from django.forms import forms


class TabularInline(BaseTabularInline):
    template = 'pretty_inline/edit_inline/tabular.html'

    @property
    def media(self):
        extra = '' if settings.DEBUG else '.min'
        js = ['jquery%s.js' % extra, 'jquery.init.js']
        if self.prepopulated_fields:
            js.extend(['urlify.js', 'prepopulate%s.js' % extra])
        if self.filter_vertical or self.filter_horizontal:
            js.extend(['SelectBox.js', 'SelectFilter2.js'])

        js = forms.Media(js=[static('admin/js/%s' % url) for url in js])
        js.add_js([static('pretty_inline/js/baseInlineFormset.js')])

        return js


class StackedInline(BaseStackedInline):
    template = 'pretty_inline/edit_inline/stacked.html'

    @property
    def media(self):
        extra = '' if settings.DEBUG else '.min'
        js = ['jquery%s.js' % extra, 'jquery.init.js']
        if self.prepopulated_fields:
            js.extend(['urlify.js', 'prepopulate%s.js' % extra])
        if self.filter_vertical or self.filter_horizontal:
            js.extend(['SelectBox.js', 'SelectFilter2.js'])

        js = forms.Media(js=[static('admin/js/%s' % url) for url in js])
        js.add_js([static('pretty_inline/js/baseInlineFormset.js')])

        return js


class PrettyInline(InlineModelAdmin):
    template = 'pretty_inline/edit_inline/pretty.html'
    extra = 0

    @property
    def media(self):
        files = ['pretty_inline.js']

        js = super(PrettyInline, self).media
        js.add_js([static('pretty_inline/js/%s' % f) for f in files])
        return js

from django.conf import settings
from django.contrib.admin.options import InlineModelAdmin
from django.contrib.admin.templatetags.admin_static import static
from django import forms


class PrettyInline(InlineModelAdmin):
    template = 'admin/edit_inline/pretty.html'

    @property
    def media(self):
        extra = '' if settings.DEBUG else '.min'
        js = ['jquery%s.js' % extra, 'jquery.init.js', 'inlines%s.js' % extra, 'pretty_inline.js']
        if self.prepopulated_fields:
            js.extend(['urlify.js', 'prepopulate%s.js' % extra])
        if self.filter_vertical or self.filter_horizontal:
            js.extend(['SelectBox.js', 'SelectFilter2.js'])
        return forms.Media(js=[static('admin/js/%s' % url) for url in js])

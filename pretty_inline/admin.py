from django.contrib.admin.options import InlineModelAdmin
from django.contrib.admin.templatetags.admin_static import static


class PrettyInline(InlineModelAdmin):
    template = 'pretty_inline/edit_inline/pretty.html'

    @property
    def media(self):
        js = super(PrettyInline, self).media
        js.add_js([static('pretty_inline/js/%s' % 'pretty_inline.js'), ])
        return js

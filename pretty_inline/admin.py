from django.conf import settings
from django.contrib.admin.options import InlineModelAdmin
from django.contrib.admin.templatetags.admin_static import static


class PrettyInline(InlineModelAdmin):
    template = 'pretty_inline/edit_inline/pretty.html'
    extra = 0

    @property
    def media(self):
        files = ['pretty_inline.js']

        js = super(PrettyInline, self).media
        js.add_js([static('pretty_inline/js/%s' % f) for f in files])
        return js

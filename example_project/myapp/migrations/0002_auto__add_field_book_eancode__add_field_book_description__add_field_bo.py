# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Book.eancode'
        db.add_column(u'myapp_book', 'eancode',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=255),
                      keep_default=False)

        # Adding field 'Book.description'
        db.add_column(u'myapp_book', 'description',
                      self.gf('django.db.models.fields.TextField')(default=''),
                      keep_default=False)

        # Adding field 'Book.language'
        db.add_column(u'myapp_book', 'language',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=7),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Book.eancode'
        db.delete_column(u'myapp_book', 'eancode')

        # Deleting field 'Book.description'
        db.delete_column(u'myapp_book', 'description')

        # Deleting field 'Book.language'
        db.delete_column(u'myapp_book', 'language')


    models = {
        u'myapp.author': {
            'Meta': {'object_name': 'Author'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        },
        u'myapp.book': {
            'Meta': {'object_name': 'Book'},
            'author': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['myapp.Author']"}),
            'description': ('django.db.models.fields.TextField', [], {}),
            'eancode': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'language': ('django.db.models.fields.CharField', [], {'max_length': '7'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        }
    }

    complete_apps = ['myapp']
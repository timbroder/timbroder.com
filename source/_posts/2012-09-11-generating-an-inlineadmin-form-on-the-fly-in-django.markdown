---
author: tim
comments: true
date: 2012-09-11 19:17:52+00:00
layout: post
slug: generating-an-inlineadmin-form-on-the-fly-in-django
title: Generating an InlineModelAdmin Form on the fly in Django
wordpress_id: 1240
categories:
- Code
tags:
- django
---

I'm adding drag/drop uploading to the django admin for one of our open source projects called [Stager](https://github.com/aiaio/ai-stager). A blog post about that will follow, it's not screen-shot ready yet.  While doing this I knew we needed a pretty seamless transition after the upload finished, and that we would have to refresh the inline.  I didn't want a full page refresh, so let's ajax it in.

For these examples just assume that we have a parent CompAdmin which has an model of Comp and an inline called CompSlideInline.  We store the instance of the Comp in comp.

[python]
from django.template import loader, Context
from django.contrib.admin import helpers
from django.db import transaction
from django.contrib import admin

comp = Comp.objects.get(id=comp_id)
#get the current site
admin_site = admin.site
compAdmin = CompAdmin(Comp, admin_site)

#get all possible inlines for the parent Admin
inline_instances = compAdmin.get_inline_instances(request)
prefixes = {}

for FormSet, inline in zip(compAdmin.get_formsets(request, comp), inline_instances):
    #get the inline of interest and generate it's formset
    if isinstance(inline, CompSlideInline):
        prefix = FormSet.get_default_prefix()
        prefixes[prefix] = prefixes.get(prefix, 0) + 1
        if prefixes[prefix] != 1 or not prefix:
            prefix = "%s-%s" % (prefix, prefixes[prefix])
        formset = FormSet(instance=comp, prefix=prefix, queryset=inline.queryset(request))

#get possible fieldsets, readonly, and prepopulated information for the parent Admin
fieldsets = list(inline.get_fieldsets(request, comp))
readonly = list(inline.get_readonly_fields(request, comp))
prepopulated = dict(inline.get_prepopulated_fields(request, comp))

#generate the inline formset
inline_admin_formset = helpers.InlineAdminFormSet(inline, formset,
            fieldsets, prepopulated, readonly, model_admin=compAdmin)

#render the template
t = loader.get_template('tabular.html')
c = Context({ 'inline_admin_formset': inline_admin_formset })
rendered = t.render(c)
[/python]

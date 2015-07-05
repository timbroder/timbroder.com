---
author: tim
comments: true
date: 2012-08-23 19:45:56+00:00
layout: post
slug: getting-started-with-solr-and-django
title: Getting Started with Solr and Django
wordpress_id: 1167
categories:
- Code
tags:
- django
- python
- solr
---

[Solr](http://lucene.apache.org/solr/) is a very powerful search tool and it is pretty easy to get the basics, such as full text search, facets, and related assets up and running pretty quickly. We will be using haystack to do the communication between Django and Solr. All code for this can be viewed on [github](https://github.com/broderboy/django-solr-demo).




## Install




Assuming you already have Django up and running, the first thing we need to do is install Solr.




[shell]curl -O http://mirrors.gigenet.com/apache/lucene/solr/4.0.0-BETA/apache-solr-4.0.0-BETA.zip 
unzip apache-solr-4.0.0-BETA.zip
cd apache-solr-4.0.0-BETA 
cd example 
java -jar start.jar [/shell]




Next install pysolr and haystack. (At the time of this writing the git checkout of haystack works better with the Solr 4.0 beta then the 1.2.7 that's in pip.)




[shell]pip install pysolr 
pip install -e https://github.com/toastdriven/django-haystack.git [/shell]




Add 'haystack' to INSTALLED_APPS in settings.py and add the following haystack connection:




[python] HAYSTACK_CONNECTIONS = { 'default': { 'ENGINE': 'haystack.backends.solr_backend.SolrEngine', 'URL': 'http://127.0.0.1:8983/solr' }, } [/python]




## Full Text Search




For the example, we're going to create a simple job database that a recruiter might use. Here is the model:


[python]from django.db import models 
from django.contrib.localflavor.us 
import models as us_models

JOB_TYPES = (
	('pt', 'Part Time'), 
	('ft', 'Full Time'), 
	('ct', 'Contract')
	)

class Company(models.Model): 
	name = models.CharField(max_length=64) 
	address = models.TextField(blank=True, null=True) 
	contact_email = models.EmailField()

	def __unicode__(self): 
		return self.name

class Location(models.Model): 
	city = models.CharField(max_length=64) 
	state = us_models.USStateField()

	def __unicode__(self): 
		return "%s, %s" % (self.city, self.state)

class Job(models.Model): 
	name = models.CharField(max_length=64) 
	description = models.TextField() 
	salary = models.CharField(max_length=64, blank=True, null=True) 
	type = models.CharField(max_length=2, choices=JOB_TYPES) 
	company = models.ForeignKey(Company, related_name='jobs') 
	location = models.ForeignKey(Location, related_name='location_jobs') 
	contact_email = models.EmailField(blank=True, null=True) 
	added_at = models.DateTimeField(auto_now=True)

	def __unicode__(self): 
		return self.name
	
	def get_contact_email(self): 
		if self.contact_email: 
			return self.contact_email 

		return self.company.contact_email[/python]
The next step is to create the SearchIndex object that will be used to transpose to data to Solr. save this as search_indexes.py in the same folder as your models.py. The text field with its template will be used for full text search on Solr. The other two fields will be used to faceted (drill down) navigation. For more details on this file, check out the [haystack tutorial](http://django-haystack.readthedocs.org/en/latest/tutorial.html#handling-data).


[python]class JobIndex(indexes.SearchIndex, indexes.Indexable): 
	text = indexes.CharField(document=True, use_template=True) 
	type = indexes.CharField(model_attr='type', faceted=True) 
	location = indexes.CharField(model_attr='location', faceted=True)

	def get_model(self): 
		return Job

	def index_queryset(self): 
		return self.get_model().objects.all() [/python]




Create the search index template in your template folder with the following naming convention: search/indexes/[app]/[model]_text.txt 

For us, this is templates/search/indexes/jobs/job_text.txt




[html]{{ object.name }}
{{ object.description }}
{{ object.salary }}
{{ object.type }}
{{ object.added_at }}[/html]




Now, lets get our data into Solr. Run ./manage.py build_solr_schema to generate a schema.xml file. Move this into example\solr\conf in your Solr install. Note: if using Solr 4, edit this file and replace stopwords_en.txt with lang/stopwords_en.txt in all locations. To test everything and load your data, run: manage.py rebuild_index Subsequent updates can be made with: manage.py update_index.




If that all worked we can start working on the front-end to see the data in Django. Add this to your urls.py




[python] (r'^$', include('haystack.urls')), [/python]




At this point there are at least two templates we'll need. One for the search results page, and a sub-template to represent each item we are pulling back. My example uses [twitter bootstrap](http://twitter.github.com/bootstrap/) for some layout help and styling, see my base.html [here](https://github.com/broderboy/django-solr-demo/blob/master/templates/base.html) if interested.




Create templates/search/search.html This gives you a basic search form, the results, and pagination for a number of results




[html]{% extends 'base.html' %}
{% block hero_text %}Search{% endblock %}
{% block header %} Click around!{% endblock %}
{% block content %}
	


		

# Search


		
			{{ form.as_table }} 
		
	



	{% if query %}
		


			

### Results


			


			{% for result in page.object_list %}
				{% include 'search/_result_object.html' %} 
			{% empty %}
				No results found.
			{% endfor %}
		



		{% if page.has_previous or page.has_next %}
			


				{% if page.has_previous %}
					[
				{% endif %}
				
				« Previous

				{% if page.has_previous %}
					](?q={{ query }}&page={{ page.previous_page_number }})
				{% endif %} 
				
				| 
				
				{% if page.has_next %}
					[
				{% endif %}

				Next »

				{% if page.has_next %}
					](?q={{ query }}&page={{ page.next_page_number }})
				{% endif %}
			


		{% endif %}
	{% else %}
	{% endif %}
{% endblock %} [/html]




And the templates/search/_result_object.txt




[html]{% with obj=result.object %}



    


        
            {{ obj.name }}
        
        


            

Company: {{ obj.company }}


            

Type: {{ obj.type }}


            {% if obj.salary %}

Salary: {{ obj.salary }}

{% endif %}
            

Location: {{ obj.location }}


        


    


    


        


            

Contact: [{{ obj.get_contact_email }}](mailto:{{ obj.get_contact_email }})


            {{ obj.description }}
        


    





{% endwith %}[/html]




Start up your dev server for search!




[![](http://timbroder.com/wp-content/uploads/2012/08/solr1.png)](http://timbroder.com/wp-content/uploads/2012/08/solr1.png)




## Related Items




Adding Related Items is as simple as using the related_content tag in the haystack more_like_this tag library and tweaking out Solr config. Open up solrconfig.xml and add a MoreLikeThisHandler within thetag:




[xml]  [/xml]




Our full _result_object.html now looks like this:




[html]{% load more_like_this %}


{% with obj=result.object %}



    


        
            {{ obj.name }}
        
        


            

Company: {{ obj.company }}


            

Type: {{ obj.type }}


            {% if obj.salary %}

Salary: {{ obj.salary }}

{% endif %}
            

Location: {{ obj.location }}


        


    


    


        


            

Contact: [{{ obj.get_contact_email }}](mailto:{{ obj.get_contact_email }})


            {{ obj.description }}
            {% more_like_this obj as related_content limit 5  %}
            {% if related_content %}
                


                      

                    

**Related:**


                    


                        {% for related in related_content %}
                            
  * {{ related.object.name }}

                        {% endfor %}
                    
                


            {% endif %}
        


    





{% endwith %}
[/html]




## Facets




To get our type and location facets, we'll have to add them to a queryset and pass this to a FacetedSearchView instead of the default one. urls.py now looks like this:




[python]from django.conf.urls import patterns, include, url
from django.contrib import admin
admin.autodiscover()
from haystack.forms import FacetedSearchForm
from haystack.query import SearchQuerySet
from haystack.views import FacetedSearchView

sqs = SearchQuerySet().facet('type').facet('location')

urlpatterns = patterns('haystack.views',
    url(r'^$', FacetedSearchView(form_class=FacetedSearchForm, searchqueryset=sqs), name='haystack_search'),
)

urlpatterns = urlpatterns + patterns('',
    url(r'^admin/', include(admin.site.urls)),
    #(r'^', include('haystack.urls')),
)
[/python]




Then, we can use the generated facets in the search template in the facets variable




[html]{% extends 'base.html' %}

{% block hero_text %}Search{% endblock %}
{% block header %}

Click around!

{% endblock %}


{% block content %}



    

# Search


    
        <table >
            {{ form.as_table }}
        </table>
        
    



        {% if query %}
            


                

### Filter


                {% if facets.fields.type %}
                    


                        

#### Type


                        


                        {% for type in facets.fields.type %}
                            
  * [{{ type.0 }}]({{ request.get_full_path }}&selected_facets=type_exact:{{ type.0|urlencode }}) ({{ type.1 }})

                        {% endfor %}
                        
                    


                {% endif %}
                {% if facets.fields.location %}
                    


                        

#### Location


                        


                        {% for location in facets.fields.location %}
                            
  * [{{ location.0 }}]({{ request.get_full_path }}&selected_facets=location_exact:{{ location.0|urlencode }}) ({{ location.1 }})

                        {% endfor %}
                        
                    


                {% endif %}
            


            


                

### Results


                


                    {% for result in page.object_list %}
                        {% include 'search/_result_object.html' %}
                    {% empty %}
                        

No results found.


                    {% endfor %}
                


    
                {% if page.has_previous or page.has_next %}
                    


                        {% if page.has_previous %}[{% endif %}« Previous{% if page.has_previous %}](?q={{ query }}&page={{ page.previous_page_number }}){% endif %}
                        |
                        {% if page.has_next %}[{% endif %}Next »{% if page.has_next %}](?q={{ query }}&page={{ page.next_page_number }}){% endif %}
                    


                {% endif %}
            


        {% else %}
            


                {# Show some example queries to run, maybe query syntax, something else? #}
            


        {% endif %}
{% endblock %}[/html]


And we're done! As I said, check out the [haystack documentation](http://django-haystack.readthedocs.org/en/latest/index.html) for more information. Leave any questions in the comments and I'll be sure to answer them




[![](http://timbroder.com/wp-content/uploads/2012/08/solr2.png)](http://timbroder.com/wp-content/uploads/2012/08/solr2.png)

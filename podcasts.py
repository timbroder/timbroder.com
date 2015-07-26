from bs4 import BeautifulSoup

f = open('overcast.opml', 'r')
soup = BeautifulSoup(f.read())

for podcast in sorted(soup.findAll('outline'), key=lambda elem: elem.get('text')):
	print "* [%s](%s)" % (podcast.get('text'), podcast.get('htmlurl'))

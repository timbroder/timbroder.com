# publish.sh

# configure env
git config --global user.email 'timothy.broder@gmail.com'
git config --global user.name 'broderboy'

# checkout publish branch
git branch -D gh-pages
git checkout -b gh-pages

# commit build
git add -f output_prod
git commit -m "Build website"

git filter-branch --subdirectory-filter output_prod/ -f

git push "https://github.com/broderboy/timbroder.com-sculpin" -f gh-pages

if [ $? -ne 0 ]; then echo "Could not push the site"; exit 1; fi
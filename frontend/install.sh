wget https://code.jquery.com/jquery-1.8.2.min.js -nc -P public/libs
wget https://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.7/highlight.min.js -nc -P public/libs

cd src
npm install
grunt
cd ..
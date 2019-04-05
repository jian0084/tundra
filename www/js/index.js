/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
//Build (XCode 10 causes build issues for iOS so it needs the --buildFlag)
// cordova emulate ios --target="iPhone-8, 12.1" --buildFlag="-UseModernBuildSystem=0"

let app = {


    cardArr: [],
    url: "https://griffis.edumedia.ca/mad9022/tundra/get.profiles.php?gender=female",

    KEY: "key",
    sessionList: [],

    hometab: document.getElementById('hometab'),
    savedtab: document.getElementById('savedtab'),
    homepage: document.getElementById('homepage'),
    savedpage: document.getElementById('savedpage'),
    card: document.getElementById('card'),
    // tiny: new tinyshell(card),


    init: function () {
        document.addEventListener("deviceready", app.ready);
    },
    ready: function () {
        app.addEventListeners();
        app.getCards();
    },


    addEventListeners: function() {
        app.hometab.addEventListener('click', function(){
            app.homepage.classList.remove('hide');
            app.homepage.classList.add('selected');
            app.savedpage.classList.add('hide');
            app.savedpage.classList.remove('selected');
        });
        app.savedtab.addEventListener('click', function(){
            app.homepage.classList.add('hide');
            app.homepage.classList.remove('selected');
            app.savedpage.classList.remove('hide');
            app.savedpage.classList.add('selected');
            app.showSaved();
        });

        let id = document.getElementById('avatar').getAttribute('data-id');
        let index = app.cardArr.findIndex(card => card.id == id);

        // app.tiny.addEventListener('swipeleft', app.deleteCard);
        // app.tiny.addEventListener('swipeleft', app.saveCard);


        //temp code, will be deleted after fixing tinyshell
        document.getElementById('delete').addEventListener('click', app.deleteCard);
        document.getElementById('save').addEventListener('click', app.saveCard);
    },

    getCards: function() {
        fetch(app.url)
            .then(response => response.json())
            .then(function(data) {
                console.log(data);
                let baseURL = decodeURIComponent(data.imgBaseURL)
                data.profiles.forEach(item => {
                    let card = 
                    {
                        id: item.id,
                        firstName: item.first,
                        lastName: item.last,
                        imgURL: "https:" + baseURL + item.avatar
                    }
                    app.cardArr.push(card);
                });
                console.log(app.cardArr);
            })
            .then(function() {
                // app.displayCard(app.cardArr);
                app.displayCard(0);   
            })
            .catch((error) => console.log(error));
    },

    displayCard: function(index) {
        console.log(app.cardArr);
        console.log(index);
        let person = app.cardArr[index];
        document.getElementById('avatar').src = person.imgURL;
        document.getElementById('avatar').setAttribute('data-id', person.id);
        document.getElementById('name').textContent = `${person.firstName} ${person.lastName}`; 

        //temp solution
        document.getElementById('save').setAttribute('data-id', person.id);
        document.getElementById('delete').setAttribute('data-id', person.id);
    },

    deleteCard: function(ev) {
        let id = ev.target.getAttribute('data-id');
        let index = app.cardArr.findIndex(card => card.id == id);
        app.cardArr.splice(index, 1);
        app.displayCard(index);
        console.log(app.cardArr);
        if (app.cardArr.length < 3) {
            app.getCards();
        } 
        console.log(app.cardArr);
    },

    saveCard: function(ev) {
        let id = ev.target.getAttribute('data-id');
        let index = app.cardArr.findIndex(card => card.id == id);
        let card = app.cardArr.find(card => card.id == id);
        app.sessionList.push(card);
        sessionStorage.setItem(app.KEY, JSON.stringify(app.sessionList));
        app.cardArr.splice(index, 1);
        app.displayCard(index);
        if (app.cardArr.length < 3) {
            app.getCards();
        } 
    },

    showSaved: function() {
        let savedList = document.getElementById('saved');
        savedList.innerHTML = '';
        let arr = JSON.parse(sessionStorage.getItem(app.KEY));
        console.log(arr);
        if (arr != null) {
            arr.forEach(profile => {
                console.log(profile);
                let entry = document.createElement('li');
                entry.classList.add('entry');
                entry.classList.add('grid');
                entry.setAttribute("data-id", profile.id);

                let img = document.createElement('img');
                img.src = profile.imgURL;
                img.alt = 'avatar';
                img.title = 'avatar';
                img.height = 80;
                img.classList.add('item1');
                entry.appendChild(img);
                
                let nameContainer = document.createElement('p');
                let name = document.createTextNode(profile.firstName + ' ' + profile.lastName);
                nameContainer.appendChild(name);
                nameContainer.classList.add('item2')
                entry.appendChild(nameContainer);

                let deleteImg = document.createElement('img');
                deleteImg.classList.add('item3');
                deleteImg.src = "./img/icons8-waste-50.png";
                deleteImg.alt = 'delete';
                deleteImg.title = 'delete';
                deleteImg.height = 25;
                deleteImg.addEventListener('click', function(ev){
                    // ev.stopPropagation();
                    entry.classList.add('to-be-del');
                    let message = "Are you sure you want to delete this profie?";
                    navigator.notification.confirm(message, app.confirmDeleteSaved, 'Confirmation', ['Cancel', 'Delete'])
                });
                entry.appendChild(deleteImg);

                savedList.appendChild(entry);
            });
        }
    },

    confirmDeleteSaved: function(buttonIndex) {
        if (buttonIndex == '2'){
            let id = document.querySelector('.to-be-del').getAttribute('data-id');

            // let index1 = app.cardArr.findIndex(card => card.id == id);
            // app.cardArr.splice(index1, 1);
            // if (app.cardArr.length < 3) {
            //     app.getCards();
            // } 

            let index2 = app.sessionList.findIndex(card => card.id == id);
            app.sessionList.splice(index2, 1);
            sessionStorage.setItem(app.KEY, JSON.stringify(app.sessionList));

            app.showSaved();

        }else if (buttonIndex == '1'){
            document.querySelector('.to-be-del').classList.remove('to-be-del');
        }
    }

};

app.init();
#WebConf
WebConf is a peer-to-peer video conferencing application that enables users to connect and share video and audio streams in real-time. The application also includes a chat feature that allows users to communicate with each other during the conference. WebConf is built using WebRTC technology, and it uses Node.js and Socket.io for the signaling server. The project also includes support for tracking and displaying statistics of the connection and quality of the streams, and allows the user to choose a user-specific stream.

#Getting Started
    Overview
        This project is a Peer-to-peer video and audio conferencing web application using WebRTC and also allows for text chat between connected clients. The project is divided into four main parts: WebRTC, Statistics, Chat, and App.
    
    Prerequisites
        Node.js and npm
        A web browser that supports WebRTC (e.g., Chrome, Firefox)
        A text editor or IDE
    
    #Setting up the Project
    To set up the project, you will need to have Node.js and npm (Node Package Manager) installed on your computer.

        Clone the repository to your local machine: git clone https://github.com/aguasam/webconf_mesh.git
        Navigate to the project directory: cd WebConf
        Install the project dependencies: npm install
        Start the server: node server.js
        Open a web browser and navigate to http://localhost:3000


#Unit Tests

    #Test Suites
        Chat.js: information about the unit tests for the Chat.js module
        Statistics.js: information about the unit tests for the Statistics.js module
        WebRTC.js: information about the unit tests for the WebRTC.js module
        app.js: information about the unit tests for the app.js module
        Running the tests
        Instructions on how to run the unit tests, such as running npm test or jest in the command line.

    The project uses Jest as the testing framework for unit tests. To run the tests, use the command npm run test in the project directory. This command will run all the unit tests for the project and display the results in the terminal.

    All the unit tests for the project are located in the tests folder. Each file corresponds to the main module it tests, for example, the file WebRTC.test.js contains all the unit tests for the WebRTC.js module.

    The tests check for basic functionality and edge cases of each feature implemented in the project. For example, tests for the startLocalStream() function ensure that the correct streams are being captured and passed to the correct connections.

    We also test the other functionalities like creatingOfferFunction, gotRemoteStream, gotIceCandidate and other functionalities of WebRTC.js

    For the Chat.js module, we test the functions such as enviarMensagem, receberMensagem, exibirHistoricoMensagens and pegarDataAtual.

    For statistics.js, we test for tracking statistics for received video and audio tracks, packets sent and received, bytes sent and received and packet lost.

    For the app.js, We test the main functionalities of the application, such as handling the chat system, initializing connections and other main functionalities of the application.

    #Running the Unit Tests
    The unit tests for this project are written using Jest. To run the tests, you will need to have Jest installed on your computer.

        Install Jest: npm install --save-dev jest
        Run the tests: npm test

#Test coverage
The main logic of the project is covered by the tests but some features may not have been included because it may not be possible to test it or not be important for the overall functionality of the project.


#Project Structure
- root/
    - index.html
    - server.js
    - package.json
    - package-lock.json
    - __tests__
        - Chat.test.js
        - Statistics.test.js
        - WebRTC.test.js
        - app.test.js
    - public/
        - css/
            - style.css
            - caixa_texto.css
            - icones/
                - uicons-regular-rounded/
                    - css/
                        - uicons-regular-rounded.css
        - js/
            - Chat.js
            - Statistics.js
            - WebRTC.js
            - app.js
    - node_modules/



#Built With
    Node.js
    Express
    WebRTC
    Socket.io
    Jest

#Authors
Carlos Vinicius Ferri Pereira

#Acknowledgments
Thanks ChatGPT.

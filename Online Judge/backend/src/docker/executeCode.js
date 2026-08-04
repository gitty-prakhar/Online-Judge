import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename=fileURLToPath(import.meta.url); // convert the current file's URL to a file system path
const __dirname=path.dirname(__filename);        // get the directory containing the current file


export const executeCodeInDocker=async(language,code,input)=>{
    return new Promise((resolve,reject)=>{
        const filename=`temp_${Date.now()}`;
        let fileExtension='';
        let dockerImage='';
        let executeCommand='';

        const lang=language.toLowerCase();
        if(lang==='python'){
            fileExtension='.py';
            dockerImage='python:3.9-slim';
            executeCommand=`python /app/${filename}${fileExtension}`;
        } 
        else if(lang==='c++'||lang ==='cpp'){
            fileExtension='.cpp';
            dockerImage='gcc:latest';
            executeCommand=`g++ /app/${filename}${fileExtension} -o /app/out && /app/out`;
        } 
        else if(lang==='javascript'||lang==='js'){
            fileExtension='.js';
            dockerImage='node:18-slim';
            executeCommand=`node /app/${filename}${fileExtension}`;
        }
        else if(lang==='java'){
            fileExtension='.java';
            dockerImage='openjdk:17-slim';
            executeCommand=`java /app/${filename}${fileExtension}`; 
        } 
        else{
            return reject(new Error("Unsupported language"));
        }


        const codePath=path.join(__dirname,`${filename}${fileExtension}`);
        const inputPath=path.join(__dirname,`${filename}_input.txt`);

        fs.writeFileSync(codePath,code);
        fs.writeFileSync(inputPath,input||"");

        const dockerCmd=`docker run --rm --network none -m 256m -v "${__dirname}:/app" -i ${dockerImage} /bin/bash -c "${executeCommand}" < "${inputPath}"`;

        exec(dockerCmd,{timeout:3000},(error,stdout,stderr)=>{
            if(fs.existsSync(codePath)) fs.unlinkSync(codePath);
            if(fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

            if(error){
                if(error.killed){
                    return resolve({verdict:"Time Limit Exceeded",output:""});
                }
                return resolve({verdict:"Runtime Error",output:stderr||error.message });
            }
            return resolve({verdict:"Success",output:stdout.trim()});
        });
    });
};



/*
===============================================================================
                    DOCKER NOTES (Online Judge Perspective)
===============================================================================

These notes contain everything I learned while building my MERN Online Judge.

-------------------------------------------------------------------------------
1. WHAT IS DOCKER?
-------------------------------------------------------------------------------

Docker is a platform that allows applications to run inside isolated
environments called CONTAINERS.

Think of Docker as software that creates small isolated computers
(containers) on your computer.

Each container has its own:

- Files
- Libraries
- Installed software
- Runtime environment

Containers are isolated from each other.

Example:

                    My Laptop
                        │
                    Docker Engine
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ▼               ▼                ▼
   Container 1     Container 2     Container 3
      GCC             Python          Node.js


-------------------------------------------------------------------------------
2. WHY DO WE USE DOCKER?
-------------------------------------------------------------------------------

Suppose two projects need different versions of software.

Project A
---------
Node 18
MongoDB 6

Project B
---------
Node 22
PostgreSQL

Installing everything on the host OS causes conflicts.

Docker solves this by giving every project its own isolated environment.

-------------------------------------------------------------------------------
3. DOCKER IS NOT A VIRTUAL MACHINE
-------------------------------------------------------------------------------

Many beginners think:

Docker = Virtual Machine

Wrong.

Virtual Machine

Host OS
    │
Hypervisor
    │
Guest OS
    │
Application

Every VM has its own Operating System.

-----------------------------------------

Docker

Host OS
    │
Docker Engine
    │
Container
    │
Application

Containers SHARE the host OS kernel.

Therefore containers are:

✔ Faster
✔ Smaller
✔ Lightweight

-------------------------------------------------------------------------------
4. WHAT IS A CONTAINER?
-------------------------------------------------------------------------------

A container is an isolated running environment.

It contains

- Installed software
- Runtime
- Libraries
- Files
- Processes

Think:

Container = Running mini-computer

Every container is isolated.

If one crashes,

Other containers continue running.

-------------------------------------------------------------------------------
5. WHAT IS AN IMAGE?
-------------------------------------------------------------------------------

Image = Blueprint / Template / Sealed Box

Image contains everything required to create containers.

Example

gcc:latest

contains

- Linux filesystem
- g++ compiler
- C++ Standard Library
- Required packages

Image DOES NOT contain user code.

Image is READ ONLY.

-------------------------------------------------------------------------------
6. IMAGE VS CONTAINER
-------------------------------------------------------------------------------

Best analogy:

C++

class Car { };

↓

Car car1;
Car car2;
Car car3;

Here

Car
↓

Docker Image

car1
↓

Container

One image can create unlimited containers.

Example

              gcc:latest Image
                      │
      ┌───────────────┼──────────────┐
      ▼               ▼              ▼
 Container1     Container2      Container3

Every container is independent.

-------------------------------------------------------------------------------
7. WHAT HAPPENS WHEN WE RUN

docker run gcc:latest

-------------------------------------------------------------------------------

Docker performs these steps.

Step 1

Find image

gcc:latest

↓

If image not present

↓

Download from Docker Hub

↓

Else

Use existing image

------------------------------------

Step 2

Create new container

------------------------------------

Step 3

Run command inside container

------------------------------------

Step 4

When finished

Delete container (if --rm)

Image remains.

-------------------------------------------------------------------------------
8. WHAT IS DOCKER HUB?
-------------------------------------------------------------------------------

Docker Hub is like GitHub for Docker Images.

Example images

gcc:latest

python:3.9-slim

node:18

openjdk:17

Docker downloads images from Docker Hub.

-------------------------------------------------------------------------------
9. WHAT DOES gcc:latest MEAN?
-------------------------------------------------------------------------------

gcc

↓

Image name

latest

↓

Tag (version)

Example

gcc:11

gcc:12

gcc:latest

-------------------------------------------------------------------------------
10. DOES IMAGE CONTAIN MY CODE?
-------------------------------------------------------------------------------

NO.

Example

gcc:latest

contains only

Linux
Compiler
Libraries

My code

temp.cpp

is stored on HOST MACHINE.

It is mounted into container using

-v

-------------------------------------------------------------------------------
11. WHAT DOES docker run DO?
-------------------------------------------------------------------------------

docker run

=

Create new container from image

Start container

Execute command

Delete container (if --rm)

-------------------------------------------------------------------------------
12. ONLINE JUDGE FLOW
-------------------------------------------------------------------------------

User submits code

↓

Controller

↓

Submission stored in MongoDB

↓

BullMQ Queue

↓

Redis

↓

Worker

↓

executeCodeInDocker()

↓

Docker Container

↓

Compile

↓

Run

↓

Capture Output

↓

Update MongoDB

↓

Redis Pub/Sub

↓

SSE

↓

Browser

-------------------------------------------------------------------------------
13. HOW executeCodeInDocker() WORKS
-------------------------------------------------------------------------------

executeCodeInDocker()

↓

Create temp.cpp

↓

Create input.txt

↓

Choose image

↓

Run Docker

↓

Compile

↓

Run Program

↓

Collect stdout

↓

Delete temp files

↓

Return verdict

-------------------------------------------------------------------------------
14. HOW LANGUAGE IS CHOSEN
-------------------------------------------------------------------------------

if(language=="cpp")

Image

gcc:latest

Command

g++ temp.cpp -o out && ./out

--------------------------------------

Python

Image

python:3.9-slim

Command

python temp.py

--------------------------------------

Node

Image

node:18

Command

node temp.js

--------------------------------------

Java

Image

openjdk:17

Command

javac Main.java && java Main

-------------------------------------------------------------------------------
15. WHAT IS executeCommand?
-------------------------------------------------------------------------------

executeCommand is simply the terminal command for that language.

Example

C++

g++ temp.cpp -o out && ./out

Python

python temp.py

Node

node temp.js

Java

javac Main.java && java Main

Nothing magical.

-------------------------------------------------------------------------------
16. WHERE IS temp.cpp CREATED?
-------------------------------------------------------------------------------

Host Machine

Example

OnlineJudge/

utils/

temp_123.cpp

temp_123_input.txt

NOT inside Docker.

-------------------------------------------------------------------------------
17. HOW DOES DOCKER ACCESS temp.cpp?
-------------------------------------------------------------------------------

Using

-v

Example

Host

/temp/temp.cpp

↓

Container

/app/temp.cpp

Container can see host file.

It is NOT copied.

-------------------------------------------------------------------------------
18. WHAT DOES

-v host:/app

MEAN?
-------------------------------------------------------------------------------

-v

=

Volume Mount

Host Folder

↓

Container Folder

Example

Host

temp/

↓

Container

/app/

-------------------------------------------------------------------------------
19. WHAT DOES

--rm

DO?
-------------------------------------------------------------------------------

Delete container after execution.

Without

--rm

Thousands of stopped containers accumulate.

-------------------------------------------------------------------------------
20. WHAT DOES

-m 256m

DO?
-------------------------------------------------------------------------------

Memory Limit

Maximum RAM

256 MB

If program exceeds memory

Container is killed.

-------------------------------------------------------------------------------
21. WHAT DOES

--network none

DO?
-------------------------------------------------------------------------------

Disable Internet.

Otherwise malicious code could

Download malware

Attack websites

Mine cryptocurrency

etc.

-------------------------------------------------------------------------------
22. WHAT DOES

-i

DO?
-------------------------------------------------------------------------------

Keeps STDIN open.

Allows

program < input.txt

-------------------------------------------------------------------------------
23. WHY TEMP FILES ARE DELETED?
-------------------------------------------------------------------------------

temp.cpp

temp_input.txt

are deleted after execution.

Otherwise disk fills with files.

-------------------------------------------------------------------------------
24. WHAT IS __dirname?
-------------------------------------------------------------------------------

Directory of current file.

Example

/Users/prakhar/backend/utils

-------------------------------------------------------------------------------
25. WHAT IS __filename?
-------------------------------------------------------------------------------

Complete path of current file.

Example

/Users/prakhar/backend/utils/executeCode.js

-------------------------------------------------------------------------------
26. WHY THIS?

const __filename=fileURLToPath(import.meta.url);

-------------------------------------------------------------------------------

import.meta.url

↓

file URL

↓

file:///Users/....

fileURLToPath()

↓

Converts URL

↓

Filesystem Path

-------------------------------------------------------------------------------
27. WHY

path.dirname(__filename)

-------------------------------------------------------------------------------

Removes filename

Example

/a/b/c/file.js

↓

/a/b/c

-------------------------------------------------------------------------------
28. WHY DOCKER IS SAFE FOR ONLINE JUDGE?
-------------------------------------------------------------------------------

Suppose user submits

while(true){}

Container hangs.

Worker kills container.

Host machine survives.

--------------------------------------

Suppose user submits

system("rm -rf /")

Only container is affected.

Host remains safe.

-------------------------------------------------------------------------------
29. IF 100 USERS SUBMIT SIMULTANEOUSLY?
-------------------------------------------------------------------------------

Same image

gcc:latest

↓

Creates

Container1

Container2

Container3

...

Container100

All independent.

-------------------------------------------------------------------------------
30. WINDOWS VS LINUX CONTAINERS
-------------------------------------------------------------------------------

Host OS does NOT decide container type.

IMAGE decides.

Example

docker run gcc:latest

↓

Linux Container

--------------------------------

docker run windows/servercore

↓

Windows Container

-------------------------------------------------------------------------------
31. BEST WAY TO THINK ABOUT DOCKER
-------------------------------------------------------------------------------

Docker

↓

Creates Containers

Container

↓

Runs Application

Image

↓

Blueprint used to create Container

-------------------------------------------------------------------------------
32. COMPLETE ANALOGY
-------------------------------------------------------------------------------

Blueprint

↓

House

=

Image

↓

Container

------------------------------------

OR

Class

↓

Object

=

Image

↓

Container

------------------------------------

OR

Sealed Box

↓

Opened Box

=

Image

↓

Container

-------------------------------------------------------------------------------
33. IMPORTANT INTERVIEW DEFINITIONS
-------------------------------------------------------------------------------

Docker

A platform used to package and run applications inside isolated containers.

--------------------------------

Image

A read-only template containing everything required to create containers.

--------------------------------

Container

A running instance created from an image.

--------------------------------

Docker Hub

A repository from where Docker images are downloaded.

--------------------------------

Volume Mount

A mechanism that allows containers to access files from the host machine.

-------------------------------------------------------------------------------
34. MY ONLINE JUDGE EXECUTION FLOW
-------------------------------------------------------------------------------

User submits code

↓

BullMQ Queue

↓

Worker

↓

executeCodeInDocker()

↓

Select Image

↓

Create Container

↓

Mount temp folder

↓

Compile

↓

Execute

↓

Capture stdout/stderr

↓

Delete temp files

↓

Delete container

↓

Return Verdict

===============================================================================
                                END OF NOTES
===============================================================================
*/

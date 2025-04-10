# CITS5206 Information Technology Capstone Project: UWA Study Planner

## Introduction

This repository contains the CITS5206 Information Technology Capstone Project for **Group 5**. The goal of this project is to develop a web-based application designed to make the academic planning process for the University of Western Australia (UWA) more efficient and user-friendly. Initially tailored for the Master of Information Technology (MIT) and Master of Data Science (MDS) programs, the planner aims to replace the outdated manual planning process with an interactive tool that automatically generates a recommended study plan based on UWA’s official handbook rules and prerequisites.

This project is part of the final-semester **Information Technology Capstone Project** (CITS5206) unit, which involves close collaboration with an industry client, academic facilitators, and a student team. Our main objective is to automate and simplify the study plan management process, replacing the existing manual approach.

## Project Overview

1. **Course Coverage**  
   - The software first targets the Master of IT (MIT) and the Master of Data Science (MDS), with the potential to expand to other programs in the future.

2. **Default Plan Generation**
   - Automatically generate a recommended study plan based on the official UWA Handbook for MIT and MDS programs. The default plan accounts for semester availability and prerequisite requirements.

3. **Real-Time Validation**
   - Receive immediate feedback on any changes made to the study plan, such as prerequisite conflicts, semester clashes, or overloading, helping students stay on track for on-time graduation.

4. **Interactive Interface**
   - Enjoy a user-friendly interface that supports drag-and-drop functionality, allowing students to easily rearrange or replace units and visually understand their study paths.

5. **Customisation and Personalization**
   - Modify the recommended plan to suit individual needs—such as changed intakes, elective preferences, or accelerated study options—while preserving essential academic rules.

6. **Save and Load Plans**
   - Export a study plan as a data file and re-import it for future modifications. This ensures flexibility and reduces the need to rebuild plans from scratch.

## Project Client

- **Name:** Debora Correa  
- **Email:** [debora.correa@uwa.edu.au](mailto:debora.correa@uwa.edu.au)

## Group Facilitator

- **Name:** Rachel Cardell-Oliver
- **Email:** [rachel.cardell-oliver@uwa.edu.au](mailto:drachel.cardell-oliver@uwa.edu.au)

## Group Members

- Louie Su (24153409)
- Songwen You (24690471)
- Shaohong Zheng (24023844)
- Clementine Hu (23773237)
- Sai Charan Pokuri (23980376)
- Zaid Sayed (23882963)

## How to Contribute

### Prerequisites

- **Python >= 3.9**
- **Node.js**: see: https://nodejs.org/en

### Set up dev environment

#### 1. Clone the Repository

```bash
git clone git@github.com:LouieSu/CITS5206-Capstone-Group-5.git
cd CITS5206-Capstone-Group-5
```

#### 2. Set up backend environment

```bash
cd backend
python -m venv venv 
```

**Activate virtual environment:**

For **Windows**:

```bash
venv\Scripts\activate
```

 For **macOS/Linux:**

```bash
source venv/bin/activate
```

Then, install all required packages:

```bash
pip install -r requirements.txt
```
#### 3. Setup frontend

If you are in the `backend` directory:

```bash
cd ../frontend
```

Install required packages:

```bash
npm install
```

### Runing/Debugging

#### To start backend server

Make sure you have swiched to `backend` directory, and your Python **virtual environment is activated**, then run:

```
python manage.py runserver
```

The Django dev server will run on port `:8000` by default. Open http://localhost:8000/ to see if your environment is working.

#### To start frontend server

In dev environment, frontend should normally run through a separate server provided by React:

```bash
npm start
```

The React dev server will run on port `:3000` by default. Open http://localhost:3000/ to see if your environment is working.

The reson to use a separate server is to leverage the benefits of **Hot Module Replacement (HMR)**. 

#### Frontend/Backend communication in dev environment

The dev environment has been configured to support cross-origin requests using react proxy, see `package.json`. 

During development, if you need to call backend API, then backend server should be started. Otherwise, it is **possible** to run only frontend server if you don't need to interact with backend.

To test if your environment has successfully configured to support frontend/backend communication, start backend server first, then start fontend server, go to http://localhost:3000/, open the console of your browser, refresh the page, if you see `{"message": "UWA Study Planner, Backend communication good!"}`, then it's all good.

### Git related

#### 1. Create a Feature Branch  

```bash
git checkout -b feature/some-new-feature
```

#### 2. Commit Changes
```bash
git commit -m "Some descriptive commit message here"
```

#### 3. Push and Create Pull Request
```bash
git push origin feature/some-new-feature
```
   - Then open a Pull Request describing the changes and referencing any relevant issues.

## License

*TODO: Negotiate with the client and add a proper license for our project.*

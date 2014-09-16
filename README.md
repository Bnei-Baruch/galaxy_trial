galaxy_trial
============


Clone the repo
============
```bash
$ git clone https://github.com/iwuvjhdva/galaxy_trial.git
$ cd galaxy_trial
```
Install dependencies
================
For Debian like distributions:

```bash
sudo aptitude install python3 python3-pip
```

Install Python dependencies:

```bash
$ sudo pip install -r requirements.txt
```
Create local config
===============
By default galaxy_trial looks into ./galaxy_trial/local_settings.py for settings. This file is not a part of the Github repo, you have to create it on your own and override there any setting from ./galaxy_trial/settings.py. The minimal local_settings.py contains only one line of code:

```python
from galaxy_trial.settings import *  # NOQA
```
Initialize the database
=================

```bash
$ ./manage.py syncdb
```
When the script will ask if you want to create a super user please do that - you'll be able then login to the admin interface.
 
SQLite is used by default unless you've overridden the database settings in local_settings.py. 

Run the server
============

```bash
$ ./manage.py runserver
```
Now access http://127.0.0.1:8000/admin and assign `initiator` and `participant` groups to your superuser.

Now once you've go to http://127.0.0.1:8000/ it will redirect you to the initiator page.

Some notes
==========
Please note that remote Licode server is used by default. You may want to specify unique room name for your local installation in order to not to get participants from the default room, just add it to local_settings.py:

```python
NUVE_ROOM_NAME = 'my-unique-room-name'
```

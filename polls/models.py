from django.db import models
from django.contrib.auth.models import User


class Question(models.Model):
    question_text = models.CharField(max_length=200)
    pub_date = models.DateTimeField('date published')


class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    choice_text = models.CharField(max_length=200)
    votes = models.IntegerField(default=0)


class Company(models.Model):
    id = models.AutoField(primary_key=True)
    owner = models.ForeignKey(User, verbose_name="User", on_delete=models.CASCADE, default=None, null=True, blank=True)
    name = models.CharField(max_length=256, blank=True, null=True, default=None)
    unique_folder_name = models.CharField(max_length=128, blank=True, null=True, default=None)
    full_path = models.CharField(max_length=256, blank=True, null=True, default=None)
    created = models.DateTimeField(auto_now_add=True, auto_now=False, null=True, blank=True)
    updated = models.DateTimeField(auto_now_add=False, auto_now=True, null=True, blank=True)


class Folder(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=128, blank=True, null=True, default=None)
    unique_folder_name = models.CharField(max_length=128, blank=True, null=True, default=None)
    full_path = models.CharField(max_length=256, blank=True, null=True, default=None)
    company = models.ForeignKey(Company, verbose_name="Company", on_delete=models.CASCADE, default=None)
    created = models.DateTimeField(auto_now_add=True, auto_now=False, null=True, blank=True)
    updated = models.DateTimeField(auto_now_add=False, auto_now=True, null=True, blank=True)

    def __str__(self):
        return "(id.%s) - %s - %s - %s" % (self.id, self.name, self.unique_folder_name, self.company)   # self.share,


class ClientClipboard(models.Model):
    user = models.ForeignKey(User, verbose_name="User", on_delete=models.CASCADE, default=None, null=True, blank=True)
    file_path = models.CharField(max_length=256, blank=True, null=True, default=None)


class Comment(models.Model):
    file_path = models.CharField(max_length=256, blank=True, null=True, default=None)
    comment_text = models.CharField(max_length=256, blank=True, null=True, default=None)

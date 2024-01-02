import os
import shutil
import glob

from datetime import datetime
from django.shortcuts import render
from django.http import JsonResponse
from polls.models import Company, Folder, ClientClipboard, Comment
from django.contrib.auth import login
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.contrib.auth.decorators import login_required
from django.core.files.storage import FileSystemStorage
from django.views.decorators.csrf import csrf_exempt


# def sign_up(request):
#     first_name = request.POST.get("first_name")
#     last_name = request.POST.get("last_name")
#     email = request.POST.get("email")
#     password = request.POST.get("password")

#     new_user = User.objects.create(
#         username=email,
#         first_name=first_name,
#         last_name=last_name,
#         email=email,
#         password=make_password(password)
#     )

#     login(request, new_user)
#     return JsonResponse({"status": "Ok"})


# def index(request):
#     return render(request, 'index.html')


@login_required
def main(request):
    return render(request, 'main.html')


@csrf_exempt
def ajax_upload_file(request):
    response = None

    if request.method == "POST" and request.__getattribute__('FILES'):

        folder = Folder.objects.filter(unique_folder_name=request.POST.get("folder_url_address")).first()
        if folder:
            full_folder_patch = f"{folder.full_path}"
            file = request.FILES.getlist('file')[0]

            # Save upload file
            fs = FileSystemStorage(location=full_folder_patch,
                                   base_url=full_folder_patch)
            fs.save(file.name, file)
            # End - Save upload file

            response = JsonResponse({"status_code": "200"})
        else:
            response = JsonResponse({"status_code": "400"})

    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response["Access-Control-Max-Age"] = "1000"
    response["Access-Control-Allow-Headers"] = "X-Requested-With, Content-Type"
    return response


def ajax_recalculate_company(request):
    user = User.objects.get(id=request.user.id)
    current_company = request.POST.get("current_company")
    company = Company.objects.get(owner=user, unique_folder_name=current_company)
    folders = Folder.objects.filter(company=company)

    folders_data = {
        'company': {
            'count_files': 0,
            'total_file_size': 0.0,
        }
    }

    company_count_files = 0
    company_total_file_size = 0
    for folder in folders:
        count_files = 0
        total_file_size = 0
        for file in glob.glob(f"{folder.full_path}/*"):
            if os.path.isfile(file):
                count_files += 1
                total_file_size += os.path.getsize(file)

        total_file_size = round(total_file_size/1000000, 1)

        folders_data[folder.unique_folder_name] = {
            'count_files': count_files,
            'total_file_size': total_file_size,
        }
        company_count_files += count_files
        company_total_file_size += total_file_size

    folders_data['company']['count_files'] = company_count_files
    folders_data['company']['total_file_size'] = round(company_total_file_size, 1)

    return JsonResponse({"folders_data": folders_data})


def ajax_get_folders(request):

    folder_type = request.POST.get("folder_type")
    folders_data = []

    if request.user.id:
        user = User.objects.get(id=request.user.id)
        companies = Company.objects.filter(owner=user)

        if folder_type == 'main_page':

            for company in companies:
                folders = Folder.objects.filter(company=company)

                count_files = 0
                total_file_size = 0
                for folder in folders:
                    for file in glob.glob(f"{folder.full_path}/*"):
                        if os.path.isfile(file):
                            count_files += 1
                            total_file_size += os.path.getsize(file)

                folders_data.append({
                    'company_name': company.name,
                    'unique_folder_name': company.unique_folder_name,
                    'count_files': count_files,
                    'total_file_size': round(total_file_size/1000000, 1),
                })
        else:
            active_department = request.POST.get("active_department")
            folders = Folder.objects.filter(company_id__unique_folder_name=active_department)
            for folder in folders:

                count_files = 0
                total_file_size = 0
                for file in glob.glob(f"{folder.full_path}/*"):
                    if os.path.isfile(file):
                        count_files += 1
                        total_file_size += os.path.getsize(file)

                folders_data.append({
                    'company_name': folder.name,
                    'unique_folder_name': folder.unique_folder_name,
                    'count_files': count_files,
                    'total_file_size': round(total_file_size/1000000, 1),
                })

    return JsonResponse({"folders_data": folders_data})


def ajax_get_files(request):

    unique_folder_name = request.POST.get("unique_folder_name")
    user = User.objects.get(id=request.user.id)
    full_path_for_folder = Folder.objects.get(unique_folder_name=unique_folder_name, company__owner=user).full_path

    files_data = []

    for file in glob.glob(f"{full_path_for_folder}/*"):
        if os.path.isfile(file):
            comment = Comment.objects.filter(file_path=file).first()
            files_data.append({
                "file_name": file.split('/')[-1],
                "file_url": file,
                "file_size": round(os.path.getsize(file)/1000000, 1),
                "file_received": datetime.fromtimestamp(os.path.getctime(file)).strftime('%d-%m-%Y'),
                "file_comment": comment.comment_text if comment else '',
            })

    return JsonResponse({"files_data": files_data})


def ajax_create_folder(request):

    user = User.objects.get(id=request.user.id)
    last_company = Company.objects.last()
    company_id = last_company.id + 1 if last_company else 1
    company_name = request.POST.get("new_folder_name")
    unique_folder_name = f"{company_name.lower().replace(' ', '-')}_{company_id}"
    full_path = f"media/company_{unique_folder_name}"

    Company.objects.create(
        id=company_id,
        owner=user,
        name=company_name,
        unique_folder_name=unique_folder_name,
        full_path=full_path
    )

    os.mkdir(full_path)

    return JsonResponse({"unique_folder_name": unique_folder_name})


def ajax_create_sub_folder(request):

    last_folder = Folder.objects.last()
    folder_id = last_folder.id + 1 if last_folder else 1
    folder_name = request.POST.get("new_folder_name")
    unique_folder_name = f"{folder_name.lower().replace(' ', '-')}_{folder_id}"

    parent_folder = request.POST.get("parent_folder")
    parent_folder_obj = Company.objects.filter(unique_folder_name=parent_folder).first()

    full_path = f"{parent_folder_obj.full_path}/{unique_folder_name}"

    Folder.objects.create(
        id=folder_id,
        name=folder_name,
        unique_folder_name=unique_folder_name,
        full_path=full_path,
        company=parent_folder_obj,
    )
    os.mkdir(full_path)
    return JsonResponse({'folder_name': folder_name, 'unique_folder_name': unique_folder_name})


def ajax_rename_folder(request):

    folder = None
    folder_type = request.POST.get("folder_type")

    if folder_type == 'company':
        folder = Company.objects.get(unique_folder_name=request.POST.get("unique_folder_name"))
    elif folder_type == 'department':
        folder = Folder.objects.get(unique_folder_name=request.POST.get("unique_folder_name"))

    new_folder_name = request.POST.get("new_folder_name")
    new_unique_folder_name = f"{new_folder_name.lower().replace(' ', '-')}_{folder.id}"
    new_patch_folder_name = folder.full_path.replace(folder.unique_folder_name, new_unique_folder_name)

    os.rename(folder.full_path, new_patch_folder_name)

    folder.name = new_folder_name
    folder.unique_folder_name = new_unique_folder_name
    folder.full_path = new_patch_folder_name
    folder.save()

    return JsonResponse({"unique_folder_name": new_unique_folder_name})


def ajax_rename_file(request):
    old_file_name = request.POST.get("old_file_name").replace("\xa0", " ")
    old_file_path = request.POST.get("file_path").replace("\xa0", " ")

    new_file_name = request.POST.get("new_file_name")
    new_file_path = old_file_path.replace(old_file_name, new_file_name)

    os.rename(old_file_path, new_file_path)

    return JsonResponse({"status": "Ok", "new_file_path": new_file_path})


def ajax_move_file(request):
    old_file_path = request.POST.get("old_file_path")
    if old_file_path:
        old_file_path = old_file_path.replace("\xa0", " ")

    new_unique_folder_name = request.POST.get("new_unique_folder_name")
    separate_file_path = old_file_path.split("/")
    separate_file_path[2] = new_unique_folder_name
    new_file_path = '/'.join(separate_file_path)

    shutil.move(old_file_path, new_file_path)

    return JsonResponse({"status": "Ok"})


def ajax_delete_folder(request):

    folder = None
    folder_type = request.POST.get("folder_type")

    if folder_type == 'company':
        folder = Company.objects.get(unique_folder_name=request.POST.get("unique_folder_name"))
    elif folder_type == 'department':
        folder = Folder.objects.get(unique_folder_name=request.POST.get("unique_folder_name"))

    if os.path.isdir(folder.full_path):
        shutil.rmtree(folder.full_path)

    folder.delete()

    return JsonResponse({"status": "Ok"})


def ajax_delete_file(request):
    file_path = request.POST.get("file_path").replace("\xa0", " ")
    os.remove(file_path)
    return JsonResponse({"status": "Ok"})


def ajax_copy_file_to_clipboard(request):
    user = User.objects.get(id=request.user.id)
    file_path = request.POST.get("file_path")
    ClientClipboard.objects.update_or_create(
        user=user,
        defaults={'file_path': file_path}
    )
    return JsonResponse({"status": "Ok"})


def ajax_add_comment_to_file(request):
    file_path = request.POST.get("file_path")
    comment_text = request.POST.get("file_comment")
    Comment.objects.update_or_create(
        file_path=file_path,
        defaults={'comment_text': comment_text}
    )
    return JsonResponse({"status": "Ok"})


def ajax_past_file_from_clipboard(request):

    user = User.objects.get(id=request.user.id)
    old_file_path = ClientClipboard.objects.get(user=user).file_path
    old_file_path = old_file_path.replace("\xa0", " ")
    file_name = old_file_path.split('/')[-1]

    to_department = request.POST.get("to_department")
    print('111', to_department)

    new_file_path = Folder.objects.get(unique_folder_name=to_department).full_path
    new_file_path = f'{new_file_path}/{file_name}'
    print(222, old_file_path)
    print(333, new_file_path)
    shutil.copy(old_file_path, new_file_path)

    ClientClipboard.objects.get(user=user).delete()

    result = {
        "file_name": file_name,
        "file_size": round(os.path.getsize(new_file_path)/1000000, 1),
        "file_url": new_file_path,
        "file_received": datetime.fromtimestamp(os.path.getctime(new_file_path)).strftime('%d-%m-%Y'),
        "current_department": to_department,
    }

    return JsonResponse({"status": "Ok", "result": result})

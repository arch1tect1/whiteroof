from django.urls import path

from . import views

urlpatterns = [
    path('', views.main, name='main'),

    path('ajax-upload-file', views.ajax_upload_file, name='ajax_upload_file'),

    path('ajax-recalculate-company', views.ajax_recalculate_company, name='ajax_recalculate_company'),

    path('ajax-get-folders', views.ajax_get_folders, name='ajax_get_folders'),
    path('ajax-get-files', views.ajax_get_files, name='ajax_get_files'),

    path('ajax-create-folder', views.ajax_create_folder, name='ajax_create_folder'),
    path('ajax-create-sub-folder', views.ajax_create_sub_folder, name='ajax_create_sub_folder'),

    path('ajax-rename-folder', views.ajax_rename_folder, name='ajax_rename_folder'),
    path('ajax-rename-file', views.ajax_rename_file, name='ajax_rename_file'),

    path('ajax-move-file', views.ajax_move_file, name='ajax_move_file'),

    path('ajax-delete-folder', views.ajax_delete_folder, name='ajax_delete_folder'),
    path('ajax-delete-file', views.ajax_delete_file, name='ajax_delete_file'),

    path('ajax-copy-file-to-clipboard', views.ajax_copy_file_to_clipboard, name='ajax_copy_file_to_clipboard'),
    path('ajax-past-file-from-clipboard', views.ajax_past_file_from_clipboard, name='ajax_past_file_from_clipboard'),

    path('ajax-copy-file-to-clipboard', views.ajax_copy_file_to_clipboard, name='ajax_copy_file_to_clipboard'),

    path('ajax-add-comment-to-file', views.ajax_add_comment_to_file, name='ajax_add_comment_to_file'),
]
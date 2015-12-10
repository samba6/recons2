from django.contrib import admin
from letter_of_credit.models import UploadedFormM


@admin.register(UploadedFormM)
class UploadedFormMAdmin(admin.ModelAdmin):
    list_display = (
        'mf', 'ba', 'ccy', 'fob_formatted', 'cost_freight_formatted', 'applicant', 'submitted_at', 'validated_at',
        'uploaded_at')
    search_fields = (
    'mf', 'ba', 'ccy', 'fob', 'cost_freight', 'applicant', 'submitted_at', 'validated_at', 'uploaded_at')

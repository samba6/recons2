from django.shortcuts import render
from rest_framework import generics, pagination
from core_recons.views import CoreAppsView
from letter_of_credit.models import FormM, LCIssue, LCIssueConcrete
from letter_of_credit.serializers import FormMSerializer, LCIssueSerializer, LCIssueConcreteSerializer

import logging

logger = logging.getLogger('recons_logger')


class LCIssueConcreteListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = LCIssueConcreteSerializer
    queryset = LCIssueConcrete.objects.all()

    def create(self, request, *args, **kwargs):
        logger.info('Creating new letter of credit issue with incoming data = \n%r', request.data)
        return super(LCIssueConcreteListCreateAPIView, self).create(request, *args, **kwargs)


class LCIssueConcreteUpdateAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LCIssueConcrete.objects.all()
    serializer_class = LCIssueConcreteSerializer

    def update(self, request, *args, **kwargs):
        logger.info('Updating letter of credit with incoming data = \n%r', request.data)
        return super(LCIssueConcreteUpdateAPIView, self).update(request, *args, **kwargs)


class LCIssueListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = LCIssueSerializer
    queryset = LCIssue.objects.all()

    def create(self, request, *args, **kwargs):
        logger.info('Creating new letter of credit issue with incoming data = \n%r', request.data)
        return super(LCIssueListCreateAPIView, self).create(request, *args, **kwargs)


class LCIssueUpdateAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LCIssue.objects.all()
    serializer_class = LCIssueSerializer

    def update(self, request, *args, **kwargs):
        logger.info('Updating letter of credit with incoming data = \n%r', request.data)
        return super(LCIssueUpdateAPIView, self).update(request, *args, **kwargs)


class FormMListPagination(pagination.PageNumberPagination):
    page_size = 20


class FormMListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = FormMSerializer
    queryset = FormM.objects.all()
    pagination_class = FormMListPagination
    # filter_class = FormMFilter

    def create(self, request, *args, **kwargs):
        logger.info('Creating new form M with incoming data = \n%r', request.data)
        return super(FormMListCreateAPIView, self).create(request, *args, **kwargs)


class FormMUpdateAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FormM.objects.all()
    serializer_class = FormMSerializer

    def update(self, request, *args, **kwargs):
        logger.info('Updating form M with incoming data = \n%r', request.data)
        return super(FormMUpdateAPIView, self).update(request, *args, **kwargs)


class FormMHomeView(CoreAppsView):
    def get(self, request):
        template_context = {'urls': self.get_core_app_urls()}

        return render(request, 'letter_of_credit/form_m/index.html', template_context)

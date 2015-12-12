from django.conf.urls import url, patterns
from .views import ContentTypeListCreateAPIView, ContentTypeRetrieveUpdateDestroyAPIView, \
    CommentRetrieveUpdateDestroyAPIView, CommentListCreateAPIView

urlpatterns = patterns(
        '',

        url(r'^ct/?$', ContentTypeListCreateAPIView.as_view(), name='contenttype-list'),

        url(r'^ct/(?P<pk>\d+)/?$', ContentTypeRetrieveUpdateDestroyAPIView.as_view(),
            name='contenttype-detail'),
)

urlpatterns += patterns(
        '',

        url(r'^comment/?$', CommentListCreateAPIView.as_view(), name='comment-list'),

        url(r'^comment/(?P<pk>\d+)/?$', CommentRetrieveUpdateDestroyAPIView.as_view(),
            name='comment-detail'),
)
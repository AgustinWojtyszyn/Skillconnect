from rest_framework import viewsets, permissions
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .models import Skill, Message
from .serializers import SkillSerializer, MessageSerializer

class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
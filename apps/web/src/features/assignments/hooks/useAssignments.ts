import { useState, useEffect, useRef, useCallback } from 'react';
import type { Assignment, RecipientProgress, Submission } from '../types';
import * as api from '../api';

export function useAssignments(classId: string, activeWorkspaceId?: string) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<RecipientProgress[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // QA-13: Track current request context to ignore stale responses on rapid switches
  const currentClassIdRef = useRef<string>(classId);
  currentClassIdRef.current = classId;

  const currentAssignmentIdRef = useRef<string | null>(selectedAssignmentId);
  currentAssignmentIdRef.current = selectedAssignmentId;

  // Load assignments for class
  const loadAssignments = useCallback(async () => {
    const targetClassId = classId;
    try {
      setLoading(true);
      setError(null);
      const data = await api.fetchClassAssignments(targetClassId);
      // QA-13: Discard if user switched class in the meantime
      if (currentClassIdRef.current !== targetClassId) return;

      setAssignments(data);
      if (data.length > 0 && !selectedAssignmentId) {
        setSelectedAssignmentId(data[0].id);
      }
    } catch (err: any) {
      if (currentClassIdRef.current !== targetClassId) return;
      setError(err?.message || 'Không thể tải danh sách bài giao.');
    } finally {
      if (currentClassIdRef.current === targetClassId) {
        setLoading(false);
      }
    }
  }, [classId, selectedAssignmentId]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  // Load recipients for selected assignment
  useEffect(() => {
    if (!selectedAssignmentId) {
      setRecipients([]);
      setSelectedRecipientId(null);
      return;
    }

    const targetAssignmentId = selectedAssignmentId;
    let isCancelled = false;

    api.fetchAssignmentRecipients(targetAssignmentId)
      .then(data => {
        if (isCancelled || currentAssignmentIdRef.current !== targetAssignmentId) return;
        setRecipients(data);

        // If in student mode with activeWorkspaceId, find the matching recipient
        if (activeWorkspaceId) {
          const matching = data.find(r => r.workspaceId === activeWorkspaceId);
          if (matching) {
            setSelectedRecipientId(matching.id);
            return;
          }
        }
        if (data.length > 0) {
          setSelectedRecipientId(data[0].id);
        }
      })
      .catch(err => {
        if (!isCancelled) {
          setError(err?.message || 'Không thể tải danh sách nhóm nhận.');
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedAssignmentId, activeWorkspaceId]);

  // Load submissions for selected recipient
  const loadSubmissions = useCallback(async (recipientId: string) => {
    try {
      const data = await api.fetchSubmissions(recipientId);
      setSubmissions(data);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải lịch sử nộp bài.');
    }
  }, []);

  useEffect(() => {
    if (!selectedRecipientId) {
      setSubmissions([]);
      return;
    }
    loadSubmissions(selectedRecipientId);
  }, [selectedRecipientId, loadSubmissions]);

  return {
    assignments,
    selectedAssignmentId,
    setSelectedAssignmentId,
    recipients,
    selectedRecipientId,
    setSelectedRecipientId,
    submissions,
    loading,
    error,
    refreshAssignments: loadAssignments,
    refreshSubmissions: () => selectedRecipientId && loadSubmissions(selectedRecipientId),
  };
}

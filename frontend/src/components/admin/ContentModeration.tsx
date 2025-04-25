import React from 'react';
import { Card } from '../ui/card';
import  {Button}  from '../ui/Button';
import { useToast } from '../ui/use-toast';
import { Flag, Check, X, AlertTriangle, Filter } from 'lucide-react';

interface ReportedContent {
  id: string;
  type: 'confession' | 'comment';
  content: string;
  reportedBy: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reportedAt: string;
  author?: {
    username: string;
    id: string;
  };
}

const mockReportedContent: ReportedContent[] = [
  {
    id: '1',
    type: 'confession',
    content: 'This is a reported confession content...',
    reportedBy: 'user123',
    reason: 'Inappropriate content',
    status: 'pending',
    reportedAt: '2024-03-15T10:30:00Z',
    author: {
      username: 'john_doe',
      id: 'user456',
    },
  },
  {
    id: '2',
    type: 'comment',
    content: 'This is a reported comment content...',
    reportedBy: 'user789',
    reason: 'Spam',
    status: 'pending',
    reportedAt: '2024-03-15T09:15:00Z',
    author: {
      username: 'jane_smith',
      id: 'user101',
    },
  },
];

export const ContentModeration: React.FC = () => {
  const { toast } = useToast();
  const [reportedContent, setReportedContent] = React.useState<ReportedContent[]>(mockReportedContent);
  const [selectedStatus, setSelectedStatus] = React.useState<string>('pending');
  const [selectedType, setSelectedType] = React.useState<string>('all');

  const handleApprove = async (id: string) => {
    try {
      setReportedContent(reportedContent.map(item =>
        item.id === id ? { ...item, status: 'approved' } : item
      ));
      toast({
        title: 'Success',
        description: 'Content approved',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve content',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      setReportedContent(reportedContent.map(item =>
        item.id === id ? { ...item, status: 'rejected' } : item
      ));
      toast({
        title: 'Success',
        description: 'Content rejected',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject content',
        variant: 'destructive',
      });
    }
  };

  const filteredContent = reportedContent.filter(item => {
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesStatus && matchesType;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Content Moderation</h2>
        <div className="flex gap-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="all">All Types</option>
            <option value="confession">Confessions</option>
            <option value="comment">Comments</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredContent.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              No reported content to moderate
            </p>
          </Card>
        ) : (
          filteredContent.map((item) => (
            <Card key={item.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Flag className="h-5 w-5 text-primary" />
                    <span className="font-semibold capitalize">{item.type}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Reported {new Date(item.reportedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Reported by: {item.reportedBy}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Reason: {item.reason}
                  </p>
                  {item.author && (
                    <p className="text-sm text-muted-foreground">
                      Author: {item.author.username}
                    </p>
                  )}
                </div>

                <div className="p-4 bg-muted rounded">
                  <p>{item.content}</p>
                </div>

                {item.status === 'pending' && (
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleReject(item.id)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleApprove(item.id)}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                )}

                {item.status !== 'pending' && (
                  <div className="flex items-center justify-end space-x-2">
                    <span className={`text-sm ${
                      item.status === 'approved' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {item.status === 'approved' ? (
                        <Check className="h-4 w-4 inline mr-1" />
                      ) : (
                        <X className="h-4 w-4 inline mr-1" />
                      )}
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}; 
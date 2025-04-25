import React from 'react';
import { Card } from './ui/card';
import  {Button}  from './ui/Button';
import { useToast } from './ui/use-toast';
import { Lock, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

interface PrivateConfession {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isEncrypted: boolean;
}

export const PrivateVault: React.FC = () => {
  const { toast } = useToast();
  const [confessions, setConfessions] = React.useState<PrivateConfession[]>([]);
  const [isAdding, setIsAdding] = React.useState(false);
  const [newConfession, setNewConfession] = React.useState({
    title: '',
    content: '',
  });
  const [showContent, setShowContent] = React.useState<Record<string, boolean>>({});

  const handleAddConfession = async () => {
    try {
      // Here you would typically encrypt the content before saving
      const newConfessionData: PrivateConfession = {
        id: Date.now().toString(),
        title: newConfession.title,
        content: newConfession.content,
        createdAt: new Date().toISOString(),
        isEncrypted: true,
      };

      setConfessions([...confessions, newConfessionData]);
      setNewConfession({ title: '', content: '' });
      setIsAdding(false);

      toast({
        title: 'Success',
        description: 'Confession added to private vault',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add confession',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteConfession = async (id: string) => {
    try {
      setConfessions(confessions.filter((c) => c.id !== id));
      toast({
        title: 'Success',
        description: 'Confession deleted from private vault',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete confession',
        variant: 'destructive',
      });
    }
  };

  const toggleContentVisibility = (id: string) => {
    setShowContent((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Private Vault</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Store your private confessions securely with end-to-end encryption
        </p>
      </div>

      {!isAdding ? (
        <Button
          onClick={() => setIsAdding(true)}
          className="w-full md:w-auto"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Confession
        </Button>
      ) : (
        <Card className="p-6">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={newConfession.title}
              onChange={(e) => setNewConfession({ ...newConfession, title: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <textarea
              placeholder="Content"
              value={newConfession.content}
              onChange={(e) => setNewConfession({ ...newConfession, content: e.target.value })}
              className="w-full p-2 border rounded h-32"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddConfession}
                disabled={!newConfession.title || !newConfession.content}
              >
                Save
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {confessions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No private confessions yet
          </p>
        ) : (
          confessions.map((confession) => (
            <Card key={confession.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold">{confession.title}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleContentVisibility(confession.id)}
                    >
                      {showContent[confession.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteConfession(confession.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {showContent[confession.id] && (
                  <p className="text-muted-foreground">{confession.content}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Created {new Date(confession.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}; 
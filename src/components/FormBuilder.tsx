'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GripVertical, X } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

type QuestionType = 'text' | 'multiple';

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
}

interface FormBuilderProps {
  initialTitle?: string;
  initialDescription?: string;
  initialQuestions?: Question[];
  onSubmit: (data: { title: string; description: string; questions: Question[] }) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export default function FormBuilder({
  initialTitle = '',
  initialDescription = '',
  initialQuestions = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
}: FormBuilderProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions.length > 0 ? initialQuestions : [
    { id: generateId(), text: '', type: 'text', required: true }
  ]);

  function generateId() {
    return Math.random().toString(36).substring(2, 9);
  }

  const addQuestion = (type: QuestionType = 'text') => {
    const newQuestion: Question = {
      id: generateId(),
      text: '',
      type,
      required: true,
    };

    if (type === 'multiple') {
      newQuestion.options = ['', ''];
    }

    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ));
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        return { ...q, options: [...q.options, ''] };
      }
      return q;
    }));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options && q.options.length > 2) {
        const newOptions = q.options.filter((_, i) => i !== optionIndex);
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setQuestions(items);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate questions
    const hasEmptyQuestions = questions.some(q => !q.text.trim() || 
      (q.type === 'multiple' && q.options?.some(opt => !opt.trim()))
    );
    
    if (hasEmptyQuestions) {
      alert('Please fill in all question fields and options');
      return;
    }
    
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      questions: questions.map(q => ({
        ...q,
        text: q.text.trim(),
        options: q.options?.map(opt => opt.trim())
      }))
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Form Title *
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter form title"
            required
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter form description (optional)"
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Questions</h3>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addQuestion('multiple')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Multiple Choice
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addQuestion('text')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Text Answer
            </Button>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="questions">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {questions.map((q, index) => (
                  <Draggable key={q.id} draggableId={q.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              {...provided.dragHandleProps}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <GripVertical className="h-5 w-5" />
                            </button>
                            <span className="text-sm font-medium text-gray-700">
                              {q.type === 'text' ? 'Text Answer' : 'Multiple Choice'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <select
                              value={q.type}
                              onChange={(e) => updateQuestion(q.id, { 
                                type: e.target.value as QuestionType,
                                ...(e.target.value === 'multiple' && { options: ['', ''] })
                              })}
                              className="text-sm border rounded px-2 py-1"
                            >
                              <option value="text">Text</option>
                              <option value="multiple">Multiple Choice</option>
                            </select>
                            {questions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeQuestion(q.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="mb-3">
                          <Input
                            type="text"
                            value={q.text}
                            onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                            placeholder="Question text"
                            required
                          />
                        </div>

                        {q.type === 'multiple' && q.options && (
                          <div className="space-y-2 ml-6">
                            {q.options.map((option, i) => (
                              <div key={i} className="flex items-center space-x-2">
                                <div className="h-4 w-4 rounded-full border border-gray-300" />
                                <Input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateOption(q.id, i, e.target.value)}
                                  placeholder={`Option ${i + 1}`}
                                  className="flex-1"
                                  required
                                />
                                {q.options && q.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => removeOption(q.id, i)}
                                    className="text-gray-400 hover:text-red-500"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <div className="mt-2">
                              <button
                                type="button"
                                onClick={() => addOption(q.id)}
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add option
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="mt-3 pt-2 border-t">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={q.required}
                              onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">Required</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Form'}
        </Button>
      </div>
    </form>
  );
}
